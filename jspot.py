import os
import re

html_re = re.compile("<l-10n\s*((?P<prop>\w+)=?[\"'](?P<propval>[^\"']+)[\"'])?>\s*(?P<string>[\S][\w\W]+?)(?:\s*<\/l-10n>)")
global_js_re = re.compile("\.__\(\s*[\"'](.+)(?:[\"']\s*\))")
param_js_re = re.compile("\._p\(\s*[\"'](.+)(?:[\"']\s*,)\s*(.+)(?:\s*\))")
ctx_js_re = re.compile("\._x\(\s*[\"'](.+)(?:[\"']\s*,)\s*[\"'](.+)(?:[\"']\s*)")
arg_re = re.compile("[a-zA-Z][a-zA-Z1-9]*")

comment_js_re = re.compile("\/\/\s*TN:.*")
param_start_re = re.compile("\._p\(")
pre_param_start_re = re.compile(".*(?:\._p\()")

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
                contexts[match.group('propval')][match.group("string")] = {"val", ""}
            elif (match.group("prop") == "attr"):
                attr_match = re.search(match.group("propval") + "=[\"']([^\"']+)[\"']", match.group("string"))
                if (attr_match.group(1)):
                    contexts["global"][attr_match.group(1)] = {"val": ""}
        else:
            contexts["global"][match.group("string")] = {"val": ""}
class It:
    it = 0
    def reset(self):
        self.it = 0
    def get(self):
        self.it += 1
        return self.it

def commit_parameterized(args, translators_note = ""):
    i = It()
    print ("\n  [" + ",".join(args) + "]\n")
    sanitisedArgs = map(lambda a: a.strip() if arg_re.fullmatch(a.strip()) else f"arg{i.get()}" , args[1:-1])
    t_dict = { "val": f"({', '.join(sanitisedArgs)}) => \"\"" }
    if (translators_note != ""):
        t_dict["tn"] = translators_note
    contexts["global"][args[0][1:-1]] = t_dict


def parse_js_calls(file):
    last_note = ""
    buffer = ""
    args = []
    reading = False
    escaped = False
    brace_count = 0
    in_quote = False
    done = False

    while True:
        char = file.read(1)
        if char == "":
            break
        buffer += char

        if not reading and char == "\n":
            tn_match = comment_js_re.search(buffer)
            if tn_match is not None:
                last_note = tn_match.group(0)
            buffer = ""
            continue
            
        if not reading and param_start_re.search(buffer) is not None:
            print(buffer)
            buffer = ""
            brace_count = 1
            reading = True
            continue

        if reading:
            #print(char)
            if char == "\\":
                escaped = True
            if not escaped:
                if char == "(":
                    brace_count += 1
                elif char == ")":
                    brace_count -= 1
                elif char == "\"" or char == "'":
                    if in_quote and in_quote == char:
                        in_quote = False
                    elif not in_quote:
                        in_quote = char
            escaped = False

            if not in_quote and brace_count == 1 and char == ",":
                args.append(buffer[:-1])
                buffer = ""
            #print(f"bc: {brace_count}")
            if brace_count == 0:
                args.append(buffer[:-1])
                commit_parameterized(args, last_note)
                last_note = ""
                reading = False
                args = []


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
    elif (file[-12:] == "date-time.js"):
        #evaluate_js_calls(fstream.read())
        parse_js_calls(fstream)

def scan_files(dir):
    for root, dirs, files in os.walk(dir):
        for filename in files:
            # print(os.path.join(root, filename))
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
#    write_jspot(os.path.join(pwd, "lang/language-pack.jspot"), "LanguagePack")
    for k, v in contexts.items():
        print(k + ": { ")
        for s, t in v.items():
            if "tn" in t:
                print(t["tn"])
            print(s + ": " + t["val"])
        print("}")
        

__main__()
