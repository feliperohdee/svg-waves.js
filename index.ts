const OPACITY_ARR: number[] = [0.265, 0.4, 0.53, 1];
const SVGNS: string = 'http://www.w3.org/2000/svg';

interface Point {
    x: number;
    y: number;
}

interface ControlPoints {
    p1: number[];
    p2: number[];
}

interface SVG {
    w: number;
    h: number;
    xmlns: string;
    path: string[];
}

interface WaveOpts {
    gradient?: boolean;
    gradientAngle?: number;
    gradientColors?: string[];
    fill?: string;
    h?: number;
    layers?: number;
    mode?: 'classic' | 'chairLeft' | 'chairRight';
    seed?: number;
    segments?: number;
    stroke?: string;
    strokeW?: number;
    variance?: number;
    w?: number;
}

export default class Wave {
    private gradient: boolean;
    private gradientAngle: number;
    private gradientColors: string[];
    private fill: string;
    private h: number;
    private layers: number;
    private mode: 'classic' | 'chairLeft' | 'chairRight';
    private seed: number;
    private segments: number;
    private stroke: string;
    private strokeW: number;
    private variance: number;
    private w: number;

    constructor(opts: WaveOpts = {}) {
        this.gradient = opts.gradient || false;
        this.gradientAngle = opts.gradientAngle && opts.gradientAngle > 0 ? opts.gradientAngle : 270;
        this.gradientColors = opts.gradientColors && opts.gradientColors.length > 0 ? opts.gradientColors : ['#F78DA7', '#8ED1FC'];
        this.fill = opts.fill || '#000000';
        this.h = opts.h && opts.h > 0 ? opts.h : 50;
        this.layers = opts.layers && opts.layers > 0 ? opts.layers : 2;
        this.mode = opts.mode || 'classic';
        this.seed = opts.seed || 0;
        this.segments = opts.segments && opts.segments > 0 ? opts.segments : 10;
        this.stroke = opts.stroke || 'none';
        this.strokeW = opts.strokeW || 0;
        this.variance = opts.variance && opts.variance > 0 ? opts.variance : 0.75;
        this.w = opts.w && opts.w > 0 ? opts.w : 100;
    }

    private computeControlPoints(K: number[]): ControlPoints {
        let p1: number[] = [];
        let p2: number[] = [];
        let n = K.length - 1;

        let a: number[] = [];
        let b: number[] = [];
        let c: number[] = [];
        let r: number[] = [];

        a[0] = 0;
        b[0] = 2;
        c[0] = 1;
        r[0] = K[0] + 2 * K[1];

        for (let i = 1; i < n - 1; i++) {
            a[i] = 1;
            b[i] = 4;
            c[i] = 1;
            r[i] = 4 * K[i] + 2 * K[i + 1];
        }

        a[n - 1] = 2;
        b[n - 1] = 7;
        c[n - 1] = 0;
        r[n - 1] = 8 * K[n - 1] + K[n];

        for (let i = 1; i < n; i++) {
            let m = a[i] / b[i - 1];
            b[i] = b[i] - m * c[i - 1];
            r[i] = r[i] - m * r[i - 1];
        }

        p1[n - 1] = r[n - 1] / b[n - 1];
        for (let i = n - 2; i >= 0; --i) {
            p1[i] = (r[i] - c[i] * p1[i + 1]) / b[i];
        }

        for (let i = 0; i < n - 1; i++) {
            p2[i] = 2 * K[i + 1] - p1[i + 1];
        }

        p2[n - 1] = 0.5 * (K[n] + p1[n - 1]);

        return { p1, p2 };
    }

    private generatePath(curvePoints: Point[], leftCornerPoint: Point, rightCornerPoint: Point): string {
        const xPoints = curvePoints.map(p => p.x);
        const yPoints = curvePoints.map(p => p.y);

        const xControlPoints = this.computeControlPoints(xPoints);
        const yControlPoints = this.computeControlPoints(yPoints);

        let path = `M ${leftCornerPoint.x},${leftCornerPoint.y} `;
        path += `L ${xPoints[0]},${yPoints[0]} `;

        for (let i = 0; i < xPoints.length - 1; i++) {
            path += `C ${xControlPoints.p1[i]},${yControlPoints.p1[i]} ${xControlPoints.p2[i]},${yControlPoints.p2[i]} ${xPoints[i+1]},${yPoints[i+1]} `;
        }

        path += `L ${rightCornerPoint.x},${rightCornerPoint.y} L ${leftCornerPoint.x},${leftCornerPoint.y} Z`;

        return path;
    }

    private generatePoints(): Point[][] {
        const cellWidth = this.w / this.segments;
        const cellHeight = this.h / (this.layers + 1);
        const moveLimitX = cellWidth * this.variance * 0.5;
        const moveLimitY = cellHeight * this.variance;
        
        let points: Point[][] = [];
        let y = moveLimitY;

        if (this.mode === 'chairLeft' || this.mode === 'chairRight') {
            y += this.layers * 75;
        }

        for (let layerIndex = 0; layerIndex < this.layers; layerIndex++) {
            let level = 0;
            let pointsPerLayer: Point[] = [{ x: 0, y }];

            for (let x = cellWidth; x < this.w; x += cellWidth) {
                const varietalY = y - moveLimitY / 2 + this.random() * moveLimitY + level;
                const varietalX = x - moveLimitX / 2 + this.random() * moveLimitX;

                pointsPerLayer.push({ x: varietalX, y: varietalY });

                if (this.mode === 'chairLeft' || this.mode === 'chairRight') {
                    level += 75;
                }
            }

            pointsPerLayer.push({ x: this.w, y: y + level });

            points.push(pointsPerLayer);
            y += cellHeight;
        }

        return points;
    }

    private generateSvg(): SVG {
        const points = this.generatePoints();
        const path = points.map(pointLayer => {
            return this.generatePath(pointLayer, { x: 0, y: this.h }, { x: this.w, y: this.h });
        });

        return {
            w: this.w,
            h: this.h,
            xmlns: SVGNS,
            path
        };
    }

    private random(): number {
        this.seed++;
        const x = Math.sin(this.seed) * 10000;

        return x - Math.floor(x);
    }

    public render(): string {
        const gradient = this.gradient && this.gradientColors.length >= 2;
        const svg = this.generateSvg();
        const opacity = OPACITY_ARR.slice(-svg.path.length);

        let content = '';

        if (gradient) {
            const anglePI = this.gradientAngle * (Math.PI / 180);
            
            content += `
                <defs>
                    <linearGradient id='gradient' x1='${Math.round(50 + Math.sin(anglePI) * 50)}%' y1='${Math.round(50 + Math.cos(anglePI) * 50)}%' x2='${Math.round(50 + Math.sin(anglePI + Math.PI) * 50)}%' y2='${Math.round(50 + Math.cos(anglePI + Math.PI) * 50)}%'>
                        ${this.distributeGradientStops(this.gradientColors, 5, 95)}
                    </linearGradient>
                </defs>
            `;
        }

        svg.path.forEach((p, index) => {
            content += `<path d='${p}' stroke='${this.stroke}' stroke-width='${this.strokeW}' fill='${gradient ? 'url(#gradient)' : this.fill}' fill-opacity='${opacity[index]}'></path>`;
        });

        return `<svg id='svg' viewBox='0 0 ${svg.w} ${svg.h}' xmlns='${svg.xmlns}'>${content}</svg>`;
    }

    private distributeGradientStops(gradientColors: string[], rangeFrom: number, rangeTo: number): string {
        if (gradientColors.length < 2) {
            return '';
        }

        const stepSize = (rangeTo - rangeFrom) / (gradientColors.length - 1);

        return gradientColors.map((color, i) => {
            const offset = rangeFrom + (i * stepSize);

            return `<stop offset='${offset}%' stop-color='${color}' />`;
        }).join('');
    }
}
