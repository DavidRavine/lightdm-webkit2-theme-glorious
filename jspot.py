import os
import re

html_re = re.compile("<l-10n\s*((?P<prop>\w+)=?[\"'](?P<propval>[^\"']+)[\"'])?>\s*(?P<string>[\S][\w\W]+?)(?:\s*<\/l-10n>)")
arg_re = re.compile("[a-zA-Z][a-zA-Z1-9]*")

no_parse_re = re.compile("\/\/\s*JSPOT:NOPARSE")
comment_js_re = re.compile("\/\/\s*TN:.*")
l10n_start_re = re.compile("\.(_[px_])\(")

line_num = 0
current_file = ""
contexts = {
    "global": {}
}

def sanitiseKey(string):
    sanitised = string.replace("\\", "\\\\")
    return sanitised.replace("\"", '\\\"')

def evaluate_html_tags(fcontents):
    for match in html_re.finditer(fcontents):
        if match.group('prop'):
            if (match.group("prop") == "context"):
                key = sanitiseKey(match.group("prop"))
                if key not in contexts:
                    contexts[key] = {}
                contexts[key][match.group("string")] = {"val", ""}
            elif (match.group("prop") == "attr"):
                attr_match = re.search(match.group("propval") + "=[\"']([^\"']+)[\"']", match.group("string"))
                if (attr_match.group(1)):
                    contexts["global"][sanitiseKey(attr_match.group(1))] = {"val": ""}
        else:
            contexts["global"][sanitiseKey(match.group("string"))] = {"val": ""}
class It:
    it = 0
    def reset(self):
        self.it = 0
    def get(self):
        self.it += 1
        return self.it

def warn_num_args(func_name, expected, given):
    print(f"WARINING: in {current_file}:{line_num} :: invalid nuber of arguments for {func_name}, expected {expected}, {given} given")

def build_t_dict(val, tn):
    t_dict = { "val": val }
    if tn != "":
        t_dict["tn"] = tn
    return t_dict

def commit_global(args, translators_note = ""):
    if len(args) != 1:
        warn_num_args("__(string)", 1, len(args))
        return
    contexts["global"][args[0][1:-1]] = build_t_dict("", translators_note)

def commit_contextual(args, translators_note = ""):
    if len(args) != 2:
        warn_num_args("_x(string, context)", 2, len(args))
        return
    ctx = args[1][2:-1]
    if ctx not in contexts:
        contexts[ctx] = {}
    contexts[ctx][args[0][1:-1]] = build_t_dict("", translators_note)


def commit_parameterized(args, translators_note = ""):
    if len(args) < 3:
        warn_num_args("_p(string, ...params)", "at least 3", len(args))
        return
    i = It()
    print ("\n  [" + ",".join(args) + "]\n")
    sanitisedArgs = map(lambda a: a.strip() if arg_re.fullmatch(a.strip()) else f"arg{i.get()}" , args[1:-1])
    t_dict = { "val": f"({', '.join(sanitisedArgs)}) => \"\"" }
    if (translators_note != ""):
        t_dict["tn"] = translators_note
    contexts["global"][args[0][1:-1]] = t_dict


def parse_js_calls(file):
    line_num = 0
    last_note = ""
    buffer = ""
    args = []
    reading = False
    escaped = False
    brace_count = 0
    in_quote = False
    match_type = ""

    while True:
        char = file.read(1)
        if char == "":
            break
        buffer += char

        if char == "\n":
            line_num += 1

            if not reading:
                if no_parse_re.search(buffer) is not None:
                    return
                tn_match = comment_js_re.search(buffer)
                if tn_match is not None:
                    last_note = tn_match.group(0)
                buffer = ""
                continue

        if not reading:
            l10n_match = l10n_start_re.search(buffer)
            if l10n_match is not None:
                match_type = l10n_match.group(1)

            if match_type != "":
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
                if (match_type == "_p"):
                    commit_parameterized(args, last_note)
                elif (match_type == "__"):
                    commit_global(args, last_note)
                elif (match_type == "_x"):
                    commit_contextual(args, last_note)
                match_type = ""
                last_note = ""
                reading = False
                args = []
    #endwhile

def get_strings(file):
    fstream = open(file, "r")

    if (file[-4:] == "html"):
        evaluate_html_tags(fstream.read())
    elif (file[-2:] == "js"):
        parse_js_calls(fstream)

def scan_files(dir):
    for root, dirs, files in os.walk(dir):
        for filename in files:
            # print(os.path.join(root, filename))
            get_strings(os.path.join(root, filename))

def indent(file, width):
    for i in range(0, width):
        file.write(" ")

def write_jspot(filename, package_name):
    file = open(filename, "w")
    file.write(package_name + " = {\n")
    depth = 1

    for context, c_members in contexts.items():
        depth = 1
        if (context != "global"):
            indent(file, 4)
            depth = 2
            file.write('"' + context + '" : {\n')

        for src, target in c_members.items():
            str = '""' if target["val"] == "" else target["val"]
            if "tn" in target:
                indent(file, depth * 4)
                file.write(f"{target['tn']}\n")
            indent(file, depth * 4)
            file.write(f'"{src}": {str},\n')

        if (context != "global"):
            indent(file, 4)
            file.write("},\n")

    file.write("}\n")


def __main__():
    pwd = os.path.dirname(os.path.realpath(__file__))
    scan_files(pwd)
    write_jspot(os.path.join(pwd, "lang/language-pack.jspot"), "LanguagePack")
    return

    for k, v in contexts.items():
        print(k + ": { ")
        for s, t in v.items():
            if "tn" in t:
                print(t["tn"])
            print(s + ": " + t["val"])
        print("}")
        

__main__()
