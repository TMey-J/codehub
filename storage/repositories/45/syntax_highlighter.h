#ifndef SYNTAX_HIGHLIGHTER_H
#define SYNTAX_HIGHLIGHTER_H

#include <string>

class SyntaxHighlighter {
public:
    enum Language { NONE, C, CPP, PYTHON };
    static Language detect(const std::string &filename);
    static std::string highlight(const std::string &line, Language lang);
private:
    static bool isKeyword(const std::string &word, Language lang);
};

#endif
