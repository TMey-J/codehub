#include "syntax_highlighter.h"
#include <cctype>
#include <algorithm>
#include <vector>

SyntaxHighlighter::Language SyntaxHighlighter::detect(const std::string &filename) {
    if (filename.size() >= 2 && filename.substr(filename.size() - 2) == ".c") return C;
    if (filename.size() >= 4 && filename.substr(filename.size() - 4) == ".cpp") return CPP;
    if (filename.size() >= 3 && filename.substr(filename.size() - 3) == ".cc") return CPP;
    if (filename.size() >= 3 && filename.substr(filename.size() - 3) == ".py") return PYTHON;
    return NONE;
}

std::string SyntaxHighlighter::highlight(const std::string &line, Language lang) {
    if (lang == NONE) return line;
    std::string res;
    bool inStr = false, inCom = false;
    char strChar = 0;
    for (size_t i = 0; i < line.size(); ++i) {
        char c = line[i];
        if (inStr) {
            res.push_back(c);
            if (c == strChar && (i == 0 || line[i-1] != '\\')) inStr = false;
            continue;
        }
        if (inCom) {
            res.push_back(c);
            continue;
        }
        if (c == '"' || c == '\'') {
            inStr = true; strChar = c;
            res += "\033[33m"; res.push_back(c);
            continue;
        }
        if ((lang == C || lang == CPP) && c == '/' && i+1 < line.size() && line[i+1] == '/') {
            inCom = true; res += "\033[32m"; res.push_back(c);
            continue;
        }
        if ((lang == C || lang == CPP) && c == '/' && i+1 < line.size() && line[i+1] == '*') {
            inCom = true; res += "\033[32m"; res.push_back(c);
            continue;
        }
        if (lang == PYTHON && c == '#') {
            inCom = true; res += "\033[32m"; res.push_back(c);
            continue;
        }
        if (isalnum(c) || c == '_') {
            std::string w;
            while (i < line.size() && (isalnum(line[i]) || line[i] == '_')) w.push_back(line[i++]);
            --i;
            if (isKeyword(w, lang)) res += "\033[34m" + w + "\033[0m";
            else res += w;
            continue;
        }
        if (isdigit(c) || (c == '.' && i+1 < line.size() && isdigit(line[i+1]))) {
            std::string num;
            while (i < line.size() && (isdigit(line[i]) || line[i] == '.')) num.push_back(line[i++]);
            --i;
            res += "\033[35m" + num + "\033[0m";
            continue;
        }
        res.push_back(c);
    }
    if (inStr) res += "\033[0m";
    if (inCom) res += "\033[0m";
    return res;
}

bool SyntaxHighlighter::isKeyword(const std::string &w, Language lang) {
    static const std::vector<std::string> ck = {
        "auto","break","case","char","const","continue","default","do","double","else",
        "enum","extern","float","for","goto","if","int","long","register","return",
        "short","signed","sizeof","static","struct","switch","typedef","union",
        "unsigned","void","volatile","while"
    };
    static const std::vector<std::string> cppk = {
        "alignas","alignof","and","and_eq","asm","auto","bitand","bitor","bool","break",
        "case","catch","char","char8_t","char16_t","char32_t","class","compl","concept",
        "const","constexpr","const_cast","continue","co_await","co_return","co_yield",
        "decltype","default","delete","do","double","dynamic_cast","else","enum",
        "explicit","export","extern","false","float","for","friend","goto","if","inline",
        "int","long","mutable","namespace","new","noexcept","not","not_eq","nullptr",
        "operator","or","or_eq","private","protected","public","register",
        "reinterpret_cast","requires","return","short","signed","sizeof","static",
        "static_assert","static_cast","struct","switch","template","this","thread_local",
        "throw","true","try","typedef","typeid","typename","union","unsigned","using",
        "virtual","void","volatile","wchar_t","while","xor","xor_eq"
    };
    static const std::vector<std::string> pyk = {
        "False","None","True","and","as","assert","async","await","break","class",
        "continue","def","del","elif","else","except","finally","for","from","global",
        "if","import","in","is","lambda","nonlocal","not","or","pass","raise","return",
        "try","while","with","yield"
    };
    const std::vector<std::string> *list = nullptr;
    if (lang == C) list = &ck;
    else if (lang == CPP) list = &cppk;
    else if (lang == PYTHON) list = &pyk;
    return list && std::find(list->begin(), list->end(), w) != list->end();
}
