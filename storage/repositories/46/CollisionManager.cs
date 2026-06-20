using System.Collections.Generic;

namespace GameEngine
{
    public static class CollisionManager
    {
        public static List<Entity> Walls = new List<Entity>();

        public static bool Overlaps(Entity a, Entity b) => a.GetBounds().IntersectsWith(b.GetBounds());

        public static void Resolve(Entity a, Entity b)
        {
            var rA = a.GetBounds();
            var rB = b.GetBounds();
            float overlapX = System.Math.Min(rA.Right, rB.Right) - System.Math.Max(rA.Left, rB.Left);
            float overlapY = System.Math.Min(rA.Bottom, rB.Bottom) - System.Math.Max(rA.Top, rB.Top);
            if (overlapX < overlapY)
            {
                float sign = (rA.Center.X < rB.Center.X) ? -1 : 1;
                a.Position = new System.Drawing.PointF(a.Position.X + sign * overlapX, a.Position.Y);
            }
            else
            {
                float sign = (rA.Center.Y < rB.Center.Y) ? -1 : 1;
                a.Position = new System.Drawing.PointF(a.Position.X, a.Position.Y + sign * overlapY);
            }
        }
    }
}
