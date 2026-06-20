using System.Collections.Generic;
using System.Drawing;

namespace GameEngine
{
    public class GameStateManager
    {
        public static GameStateManager Instance { get; private set; }
        private Dictionary<string, IGameState> states = new Dictionary<string, IGameState>();
        private IGameState currentState;

        public GameStateManager()
        {
            Instance = this;
        }

        public void AddState(string name, IGameState state)
        {
            states[name] = state;
        }

        public void ChangeState(string name)
        {
            currentState?.Exit();
            currentState = states[name];
            currentState?.Enter();
        }

        public void Update()
        {
            currentState?.Update();
        }

        public void Draw(Graphics g)
        {
            currentState?.Draw(g);
        }
    }
}
