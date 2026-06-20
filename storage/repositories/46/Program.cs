using System;
using System.Drawing;
using System.Windows.Forms;

namespace GameEngine
{
    internal static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new GameForm());
        }
    }

    public class GameForm : Form
    {
        private GameEngine engine;
        private Timer timer;

        public GameForm()
        {
            this.DoubleBuffered = true;
            this.ClientSize = new Size(800, 600);
            this.Text = "Simple Game Engine";
            this.KeyPreview = true;
            this.BackColor = Color.Black;

            engine = new GameEngine(this);

            timer = new Timer();
            timer.Interval = 16; // ~60 FPS
            timer.Tick += (s, e) => { engine.Update(); this.Invalidate(); };
            timer.Start();

            this.Paint += (s, e) => engine.Draw(e.Graphics);
            this.KeyDown += (s, e) => InputManager.HandleKeyDown(e);
            this.KeyUp += (s, e) => InputManager.HandleKeyUp(e);
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            timer.Stop();
            base.OnFormClosed(e);
        }
    }
}
