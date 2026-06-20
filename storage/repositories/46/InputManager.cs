using System.Collections.Generic;
using System.Windows.Forms;

namespace GameEngine
{
    public static class InputManager
    {
        private static HashSet<Keys> currentKeys = new HashSet<Keys>();
        private static HashSet<Keys> previousKeys = new HashSet<Keys>();

        public static void Update()
        {
            previousKeys = new HashSet<Keys>(currentKeys);
        }

        public static void HandleKeyDown(KeyEventArgs e)
        {
            if (!e.Repeat)
                currentKeys.Add(e.KeyCode);
        }

        public static void HandleKeyUp(KeyEventArgs e)
        {
            currentKeys.Remove(e.KeyCode);
        }

        public static bool IsKeyDown(Keys key) => currentKeys.Contains(key);
        public static bool IsKeyJustPressed(Keys key) => currentKeys.Contains(key) && !previousKeys.Contains(key);
        public static bool IsKeyJustReleased(Keys key) => !currentKeys.Contains(key) && previousKeys.Contains(key);
    }
}
