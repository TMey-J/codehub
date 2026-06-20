using System.Drawing;
using System.Drawing.Drawing2D;

namespace GameEngine
{
    public class Camera2D
    {
        public PointF Target;
        public float Smoothness = 0.1f;
        private PointF currentPos;

        public Camera2D(int viewWidth, int viewHeight)
        {
            currentPos = new PointF(viewWidth / 2f, viewHeight / 2f);
        }

        public Matrix GetTransform(int viewWidth, int viewHeight)
        {
            currentPos.X += (Target.X - currentPos.X) * Smoothness;
            currentPos.Y += (Target.Y - currentPos.Y) * Smoothness;
            var m = new Matrix();
            m.Translate(-currentPos.X + viewWidth / 2f, -currentPos.Y + viewHeight / 2f);
            return m;
        }
    }
}
