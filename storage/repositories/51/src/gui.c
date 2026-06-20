#include <gtk/gtk.h>
#include <vte/vte.h>

int main(int argc, char *argv[]) {
    gtk_init(&argc, &argv);

    GtkWidget *window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_title(GTK_WINDOW(window), "codehub_shell");
    gtk_window_set_default_size(GTK_WINDOW(window), 800, 500);
    g_signal_connect(window, "destroy", G_CALLBACK(gtk_main_quit), NULL);

    GtkWidget *terminal = vte_terminal_new();

    char *shell_argv[] = { "./codehub_shell", NULL };
    GError *error = NULL;

    // 11‑argument call (VTE 2.91)
    if (!vte_terminal_spawn_sync(
            VTE_TERMINAL(terminal),
            VTE_PTY_DEFAULT,          // pty_flags
            NULL,                     // working_directory (NULL = current)
            shell_argv,               // argv
            NULL,                     // envv (NULL = inherit)
            G_SPAWN_SEARCH_PATH,      // spawn_flags
            NULL,                     // child_setup
            NULL,                     // child_setup_data
            NULL,                     // cancellable
            NULL,                     // child_pid (optional)
            &error)) {                // error
        g_printerr("Failed to start shell: %s\n", error->message);
        g_error_free(error);
        return 1;
    }

    gtk_container_add(GTK_CONTAINER(window), terminal);
    gtk_widget_show_all(window);

    gtk_main();
    return 0;
}
