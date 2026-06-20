using System.Drawing;

namespace GameEngine
{
    public interface IGameState
    {
        void Enter();
        void Exit();
        void Update();
        void Draw(Graphics g);
    }

    public class MenuState : IGameState
    {
        private Font font = new Font("Arial", 24);
        private Brush brush = Brushes.White;

        public void Enter() { }
        public void Exit() { }
        public void Update()
        {
            if (InputManager.IsKeyJustPressed(Keys.Enter))
                GameStateManager.Instance.ChangeState("Play");
        }
        public void Draw(Graphics g)
        {
            g.DrawString("Press ENTER to start", font, brush, 300, 250);
        }
    }

    public class PlayState : IGameState
    {
        private Player player;
        private List<Entity> walls;
        private Camera2D camera;

        public PlayState(Player player, List<Entity> walls, Camera2D camera)
        {
            this.player = player;
            this.walls = walls;
            this.camera = camera;
            CollisionManager.Walls = walls;
        }

        public void Enter() { }
        public void Exit() { }

        public void Update()
        {
            player.Update();
            camera.Target = player.Position;
            foreach (var wall in walls)
                if (CollisionManager.Overlaps(player, wall))
                    CollisionManager.Resolve(player, wall);
        }

        public void Draw(Graphics g)
        {
            player.Draw(g);
            foreach (var wall in walls)
                wall.Draw(g);
        }
    }
}
