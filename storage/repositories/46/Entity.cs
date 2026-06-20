using System.Drawing;

namespace GameEngine
{
    public class Entity
    {
        public PointF Position;
        public Size Size;
        public Color Color;
        public bool IsSolid = true;

        public Entity(PointF position, Size size, Color color)
        {
            Position = position;
            Size = size;
            Color = color;
        }

        public RectangleF GetBounds() => new RectangleF(Position, Size);

        public virtual void Update() { }

        public virtual void Draw(Graphics g)
        {
            using (var brush = new SolidBrush(Color))
                g.FillRectangle(brush, Position.X, Position.Y, Size.Width, Size.Height);
        }
    }
}
