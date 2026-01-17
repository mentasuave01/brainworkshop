// Shape SVG components for Quad N-back mode

interface ShapeProps {
    color: string;
    className?: string;
}

export const ShapeCircle = ({ color, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" class={className}>
        <circle cx="50" cy="50" r="45" fill={color} />
    </svg>
);

export const ShapeTriangle = ({ color, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" class={className}>
        <polygon points="50,5 95,95 5,95" fill={color} />
    </svg>
);

export const ShapeSquare = ({ color, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" class={className}>
        <rect x="5" y="5" width="90" height="90" fill={color} />
    </svg>
);

export const ShapeDiamond = ({ color, className }: ShapeProps) => (
    <svg viewBox="0 0 100 100" class={className}>
        <polygon points="50,5 95,50 50,95 5,50" fill={color} />
    </svg>
);

// Helper to render shape by name
export const Shape = ({ shape, color, className }: { shape: string; color: string; className?: string }) => {
    switch (shape) {
        case 'circle':
            return <ShapeCircle color={color} className={className} />;
        case 'triangle':
            return <ShapeTriangle color={color} className={className} />;
        case 'square':
            return <ShapeSquare color={color} className={className} />;
        case 'diamond':
            return <ShapeDiamond color={color} className={className} />;
        default:
            return <ShapeCircle color={color} className={className} />;
    }
};
