import os
import re

html_re = re.compile("<l-10n\s*((?P<prop>\w+)=?[\"'](?P<propval>[^\"']+)[\"'])?>\s*(?P<string>[\S][\w\W]+?)(?:\s*<\/l-10n>)")
global_js_re = re.compile("\.__\(\s*[\"'](.+)(?:[\"']\s*\))")
param_js_re = re.compile("\._p\(\s*[\"'](.+)(?:[\"']\s*,)\s*(.+)(?:\s*\))")
ctx_js_re = re.compile("\._x\(\s*[\"'](.+)(?:[\"']\s*,)\s*[\"'](.+)(?:[\"']\s*)")
arg_re = re.compile("[a-zA-Z][a-zA-Z1-9]*")

contexts = {
    "global": {}
}

def evaluate_html_tags(fcontents):
    for match in html_re.finditer(fcontents):
        if match.group('prop'):
            ctx = "global"
            if (match.group('prop') == "context"):
                if match.group("propval") not in contexts:
                    contexts[match.group('propval')] = {}
                contexts[match.group('propval')][match.group("string")] = ""
            elif (match.group("prop") == "attr"):
                attr_match = re.search(match.group("propval") + "=[\"']([^\"']+)[\"']", match.group("string"))
                if (attr_match.group(1)):
                    contexts["global"][attr_match.group(1)] = ""
        else:
            contexts["global"][match.group("string")] = ""
class It:
    it = 0
    def reset(self):
        self.it = 0
    def get(self):
        self.it += 1
        return self.it

def evaluate_js_calls(fcontents):
    for match in global_js_re.finditer(fcontents):
        contexts["global"][match.group(1)] = ""

    i = It()
    for match in param_js_re.finditer(fcontents):
        i.reset()
        args = match.group(2).split(",")
        args = map(lambda a: a.strip() if arg_re.fullmatch(a.strip()) else f"arg{i.get()}" , args)
        contexts["global"][match.group(1)] = f"({', '.join(args)}) => \"\""

    for match in ctx_js_re.finditer(fcontents):
        if match.group(2) not in contexts:
            contexts[match.group(2)] = {}
        contexts[match.group(2)][match.group(1)] = ""

def get_strings(file):
    fstream = open(file, "r")

    if (file[-4:] == "html"):
        evaluate_html_tags(fstream.read())
    elif (file[-2:] == "js"):
        evaluate_js_calls(fstream.read())

def scan_files(dir):
    for root, dirs, files in os.walk(dir):
        for filename in files:
            print(os.path.join(root, filename))
            get_strings(os.path.join(root, filename))


def write_jspot(filename, package_name):
    file = open(filename, "w")
    file.write(package_name + " = {\n")
    depth = 1

    for context, c_members in contexts.items():
        depth = 1
        if (context != "global"):
            for i in range(0, 4):
                file.write(" ")
            depth = 2
            file.write('"' + context + '" : {\n')

        for src, target in c_members.items():
            str = '""' if target == "" else target
            for i in range(0, depth*4):
                file.write(" ")
            file.write(f'"{src}": {str},\n')

        if (context != "global"):
            for i in range(0, 4):
                file.write(" ")
            file.write("},\n")

    file.write("}")


def __main__():
    pwd = os.path.dirname(os.path.realpath(__file__))
    scan_files(pwd)
    write_jspot(os.path.join(pwd, "lang/language-pack.jspot"), "LanguagePack")
    for k, v in contexts.items():
        print(k + ": { ")
        for s, t in v.items():
            print(s + ": " + t)
        print("}")
        

__main__()
