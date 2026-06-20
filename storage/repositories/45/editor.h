#ifndef EDITOR_H
#define EDITOR_H

#include <string>

class Editor {
public:
    Editor();
    ~Editor();
    void loadFile(const std::string &filename);
    void run();
private:
    class Terminal;
    class LineGapBuffer;
    class SyntaxHighlighter;
    Terminal *term;
    LineGapBuffer *buffer;
    std::string filename;
    bool modified;
    bool dirty;
    int rows, cols;
    int cursorRow, cursorCol;
    SyntaxHighlighter::Language lang;
    bool searchMode, replaceMode;
    std::string searchTerm, replaceTerm;
    void processKey(int key);
    void moveCursor(int dr, int dc);
    void refresh();
    void saveFile();
    void performSearch();
    void performReplace();
};

#endif
