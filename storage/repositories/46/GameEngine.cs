using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;

namespace GameEngine
{
    public class GameEngine
    {
        private GameStateManager stateManager;
        private Camera2D camera;
        private List<Entity> walls;
        private Player player;
        private Form form;

        public GameEngine(Form form)
        {
            this.form = form;
            camera = new Camera2D(form.ClientSize.Width, form.ClientSize.Height);
            walls = new List<Entity>();
            player = new Player(new PointF(100, 100), new Size(30, 30), Color.Blue);

            for (int i = 0; i < 5; i++)
                walls.Add(new Entity(new PointF(200 + i * 80, 300), new Size(40, 40), Color.Gray));
            walls.Add(new Entity(new PointF(500, 200), new Size(80, 20), Color.Gray));
            walls.Add(new Entity(new PointF(500, 400), new Size(80, 20), Color.Gray));

            stateManager = new GameStateManager();
            stateManager.AddState("Menu", new MenuState());
            stateManager.AddState("Play", new PlayState(player, walls, camera));
            stateManager.ChangeState("Menu");
        }

        public void Update()
        {
            InputManager.Update();
            stateManager.Update();
        }

        public void Draw(Graphics g)
        {
            g.Clear(Color.Black);
            g.Transform = camera.GetTransform(form.ClientSize.Width, form.ClientSize.Height);
            stateManager.Draw(g);
        }
    }
}
