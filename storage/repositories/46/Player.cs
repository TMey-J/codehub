using System;
using System.Drawing;

namespace GameEngine
{
    public class Player : Entity
    {
        public float MoveSpeed = 200f;

        public Player(PointF position, Size size, Color color) : base(position, size, color) { }

        public override void Update()
        {
            float dt = 1f / 60f; // fixed step
            float dx = 0, dy = 0;
            if (InputManager.IsKeyDown(Keys.W) || InputManager.IsKeyDown(Keys.Up)) dy -= 1;
            if (InputManager.IsKeyDown(Keys.S) || InputManager.IsKeyDown(Keys.Down)) dy += 1;
            if (InputManager.IsKeyDown(Keys.A) || InputManager.IsKeyDown(Keys.Left)) dx -= 1;
            if (InputManager.IsKeyDown(Keys.D) || InputManager.IsKeyDown(Keys.Right)) dx += 1;

            if (dx != 0 || dy != 0)
            {
                float len = (float)Math.Sqrt(dx * dx + dy * dy);
                dx /= len;
                dy /= len;
                PointF newPos = new PointF(Position.X + dx * MoveSpeed * dt, Position.Y + dy * MoveSpeed * dt);
                var newBounds = new RectangleF(newPos, Size);
                bool collides = false;
                foreach (var wall in CollisionManager.Walls)
                {
                    if (wall.IsSolid && newBounds.IntersectsWith(wall.GetBounds()))
                    {
                        collides = true;
                        break;
                    }
                }
                if (!collides)
                    Position = newPos;
                else
                {
                    // try X only
                    PointF xPos = new PointF(newPos.X, Position.Y);
                    var xBounds = new RectangleF(xPos, Size);
                    bool xColl = false;
                    foreach (var wall in CollisionManager.Walls)
                        if (wall.IsSolid && xBounds.IntersectsWith(wall.GetBounds())) { xColl = true; break; }
                    if (!xColl) Position = xPos;
                    else
                    {
                        PointF yPos = new PointF(Position.X, newPos.Y);
                        var yBounds = new RectangleF(yPos, Size);
                        bool yColl = false;
                        foreach (var wall in CollisionManager.Walls)
                            if (wall.IsSolid && yBounds.IntersectsWith(wall.GetBounds())) { yColl = true; break; }
                        if (!yColl) Position = yPos;
                    }
                }
            }
        }
    }
}
