#include "editor.h"
#include "terminal.h"
#include "line_gap_buffer.h"
#include "syntax_highlighter.h"
#include <cstdio>
#include <cstdlib>
#include <fstream>
#include <sstream>
#include <algorithm>

Editor::Editor() : modified(false), dirty(true), searchMode(false), replaceMode(false) {
    term = new Terminal();
    buffer = new LineGapBuffer();
    term->getSize(rows, cols);
    term->clearScreen();
    term->hideCursor();
    lang = SyntaxHighlighter::NONE;
    cursorRow = 0;
    cursorCol = 0;
}

Editor::~Editor() {
    term->showCursor();
    delete term;
    delete buffer;
}

void Editor::loadFile(const std::string &fname) {
    filename = fname;
    std::ifstream file(fname);
    if (file.is_open()) {
        std::stringstream ss;
        ss << file.rdbuf();
        buffer->setContent(ss.str());
        file.close();
    }
    lang = SyntaxHighlighter::detect(filename);
    cursorRow = 0;
    cursorCol = 0;
    dirty = true;
}

void Editor::run() {
    term->enableRaw();
    while (true) {
        if (dirty) refresh();
        int key = term->getKey();
        if (key != -1) processKey(key);
        int newRows, newCols;
        term->getSize(newRows, newCols);
        if (newRows != rows || newCols != cols) {
            rows = newRows; cols = newCols;
            dirty = true;
        }
    }
}

void Editor::processKey(int key) {
    if (searchMode) {
        if (key == 27) { searchMode = false; dirty = true; return; }
        if (key == 10) { searchMode = false; dirty = true; performSearch(); return; }
        if (key == 127 || key == 8) { if (!searchTerm.empty()) { searchTerm.pop_back(); dirty = true; } return; }
        if (key >= 32 && key <= 126) { searchTerm.push_back((char)key); dirty = true; }
        return;
    }
    if (replaceMode) {
        if (key == 27) { replaceMode = false; dirty = true; return; }
        if (key == 10) { replaceMode = false; dirty = true; performReplace(); return; }
        if (key == 127 || key == 8) { if (!replaceTerm.empty()) { replaceTerm.pop_back(); dirty = true; } return; }
        if (key >= 32 && key <= 126) { replaceTerm.push_back((char)key); dirty = true; }
        return;
    }
    if (key == 17) { term->disableRaw(); exit(0); }
    if (key == 19) { saveFile(); modified = false; dirty = true; return; }
    if (key == 6)  { searchTerm.clear(); searchMode = true; dirty = true; return; }
    if (key == 18) { replaceTerm.clear(); replaceMode = true; dirty = true; return; }
    if (key == 27) {
        int s1 = term->getKey();
        if (s1 == -1) return;
        if (s1 == 91) {
            int s2 = term->getKey();
            if (s2 == -1) return;
            switch (s2) {
                case 65: moveCursor(-1, 0); break;
                case 66: moveCursor(1, 0); break;
                case 67: moveCursor(0, 1); break;
                case 68: moveCursor(0, -1); break;
                case 51: {
                    int s3 = term->getKey();
                    if (s3 == 126) {
                        if (cursorRow < (int)buffer->lineCount() && cursorCol < (int)buffer->line(cursorRow).size()) {
                            buffer->deleteChar(cursorRow, cursorCol);
                            modified = true;
                            dirty = true;
                        } else if (cursorRow + 1 < (int)buffer->lineCount()) {
                            buffer->line(cursorRow) += buffer->line(cursorRow + 1);
                            buffer->deleteLine(cursorRow + 1);
                            modified = true;
                            dirty = true;
                        }
                    }
                    break;
                }
            }
        }
        return;
    }
    if (key == 127 || key == 8) {
        if (cursorCol > 0) {
            buffer->deleteChar(cursorRow, cursorCol - 1);
            cursorCol--;
            modified = true;
            dirty = true;
        } else if (cursorRow > 0) {
            int prevLen = buffer->line(cursorRow - 1).size();
            buffer->line(cursorRow - 1) += buffer->line(cursorRow);
            buffer->deleteLine(cursorRow);
            cursorRow--;
            cursorCol = prevLen;
            modified = true;
            dirty = true;
        }
        return;
    }
    if (key == 10) {
        std::string rest = buffer->line(cursorRow).substr(cursorCol);
        buffer->line(cursorRow).erase(cursorCol);
        buffer->insertLine(cursorRow + 1, rest);
        cursorRow++;
        cursorCol = 0;
        modified = true;
        dirty = true;
        return;
    }
    if (key >= 32 && key <= 126) {
        buffer->insertChar(cursorRow, cursorCol, (char)key);
        cursorCol++;
        modified = true;
        dirty = true;
    }
}

void Editor::moveCursor(int dr, int dc) {
    int newRow = cursorRow + dr;
    int newCol = cursorCol + dc;
    int maxRow = buffer->lineCount() - 1;
    if (newRow < 0) newRow = 0;
    if (newRow > maxRow) newRow = maxRow;
    int maxCol = buffer->line(newRow).size();
    if (newCol < 0) newCol = 0;
    if (newCol > maxCol) newCol = maxCol;
    cursorRow = newRow;
    cursorCol = newCol;
    dirty = true;
}

void Editor::refresh() {
    term->clearScreen();
    int maxDisplay = rows - 1;
    int start = 0;
    int totalLines = buffer->lineCount();
    if (totalLines > maxDisplay) {
        start = cursorRow - maxDisplay / 2;
        if (start < 0) start = 0;
        if (start + maxDisplay > totalLines) start = totalLines - maxDisplay;
    }
    for (int i = 0; i < maxDisplay; ++i) {
        if (i + start < totalLines) {
            std::string line = buffer->line(i + start);
            std::string hl = SyntaxHighlighter::highlight(line, lang);
            if ((int)hl.size() > cols) hl = hl.substr(0, cols);
            printf("%s", hl.c_str());
        }
        if (i < maxDisplay - 1) printf("\n");
    }
    term->moveCursor(rows - 1, 0);
    term->clearLine();
    if (searchMode) printf("Search: %s", searchTerm.c_str());
    else if (replaceMode) printf("Replace: %s", replaceTerm.c_str());
    else printf("%s %s %d:%d", modified ? "*" : " ", filename.c_str(), cursorRow + 1, cursorCol + 1);
    int displayRow = cursorRow - start;
    if (displayRow < 0 || displayRow >= maxDisplay) displayRow = 0;
    term->moveCursor(displayRow, cursorCol);
    dirty = false;
}

void Editor::saveFile() {
    if (filename.empty()) return;
    std::ofstream file(filename);
    if (file.is_open()) {
        file << buffer->getContent();
        file.close();
        modified = false;
    }
}

void Editor::performSearch() {
    std::string content = buffer->getContent();
    size_t pos = content.find(searchTerm);
    if (pos != std::string::npos) {
        size_t charCount = 0;
        for (size_t i = 0; i < buffer->lineCount(); ++i) {
            if (pos >= charCount && pos <= charCount + buffer->line(i).size()) {
                cursorRow = i;
                cursorCol = pos - charCount;
                break;
            }
            charCount += buffer->line(i).size() + 1;
        }
        dirty = true;
    }
}

void Editor::performReplace() {
    std::string content = buffer->getContent();
    size_t pos = content.find(searchTerm);
    if (pos != std::string::npos) {
        std::string before = content.substr(0, pos);
        std::string after = content.substr(pos + searchTerm.size());
        buffer->setContent(before + replaceTerm + after);
        size_t newPos = pos + replaceTerm.size();
        size_t charCount = 0;
        for (size_t i = 0; i < buffer->lineCount(); ++i) {
            if (newPos >= charCount && newPos <= charCount + buffer->line(i).size()) {
                cursorRow = i;
                cursorCol = newPos - charCount;
                break;
            }
            charCount += buffer->line(i).size() + 1;
        }
        modified = true;
        dirty = true;
    }
}
