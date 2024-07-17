# Waves Generator

This module provides a `Wave` class for generating customizable wave SVGs.

## Features

- Generate wave-like SVG patterns
- Customizable options including gradient, colors, dimensions, and more
- Multiple wave modes: classic, chairLeft, chairRight
- Adjustable number of layers and segments

## Usage

```typescript
import { Wave } from './waves';

const wave = new Wave({
    gradient: true,
    gradientColors: ['#F78DA7', '#8ED1FC'],
    w: 1000,
    h: 200,
    layers: 3
});

const svgString = wave.render();
````

## Options

The Wave constructor accepts an options object with the following properties:

- gradient: boolean (default: false)
- gradientAngle: number (default: 270)
- gradientColors: string[] (default: ['#F78DA7', '#8ED1FC'])
- fill: string (default: '#000000')
-h: number (default: 50)
- layers: number (default: 2)
- mode: 'classic' | 'chairLeft' | 'chairRight' (default: 'classic')
- seed: number (default: 0)
- segments: number (default: 10)
- stroke: string (default: 'none')
- strokeW: number (default: 0)
- variance: number (default: 0.75)
- w: number (default: 100)

## Methods
- render(): Generates and returns the SVG string

## Eaxample

```typescript
const wave = new Wave({
    gradient: true,
    gradientColors: ['#FF0000', '#00FF00', '#0000FF'],
    w: 800,
    h: 150,
    layers: 4,
    mode: 'chairRight',
    variance: 0.5
});

const svgString = wave.render();
console.log(svgString);
````

This will generate a wave SVG with a gradient from red to green to blue, 800px wide, 150px high, with 4 layers in 'chairRight' mode.
