import re
import os
import sys

class Parser:
    _package_name = False
    _members = []
    contexts = {
        "global": {},
    }
    def get_contexts(self):
        return self.contexts
    
    def commit_token(self, ctx, key_token, package_member = False, token = ""):
        if (not package_member):
            if (ctx not in self.contexts):
                self.contexts[ctx] = {}
            self.contexts[ctx][key_token] = {}
        else:
            if (key_token not in self.contexts[ctx]):
                print(f'  WARNING: key "{key_token}" in member "{package_member}" is not part of the template for package "{self._package_name}"!')
                print('  skipping ... ')
                return
            self.contexts[ctx][key_token][package_member] = token
        print(key_token + ": " + token)

    def parse_file(self, file):
        package_start = False
        package_name = False
        package_member = False

        token = ""
        key_token = ""
        current_context = ""
        brace_count = 0
        bracket_count = 0
        open_quote = False
        comment = False
        escape_char = False
        colon = False
        is_func = False
        whitespace = re.compile("\s")
        is_member = re.compile("([a-zA-Z]\w+)\.([a-zA-Z]\w+)")

        char = ' '
        prevChar = ''
        while char != '':
            prevChar = char
            char = file.read(1)

            # ignore line comments
            if (comment):
                if (char == '\n'):
                    comment = False
                    print("comment end")
                continue
            # ignore whitespace outside of quotes and funcs
            if (not open_quote and whitespace.match(char)):
                if ((bracket_count > 0 or is_func) and not whitespace.match(prevChar)):
                    token += " "
                continue

            if (char == '=' and not package_start):
                if (package_name):
                    print(f'  ERROR: unexpected "=" near "{token}"')
                    sys.exit()
                if (is_member.match(token)):
                    result = re.search(is_member, token)
                    package_name = result.group(1)
                    package_member = result.group(2)
                    self._members.append(package_member)
                    print("\n" + package_member)
                else:
                    package_name = token
                token = ""

                if (not self._package_name):
                    self._package_name = package_name
                elif (package_name != self._package_name):
                    print(f"  ERROR: Cannot add to package '{package_name}' while working on package '{self._package_name}'")
                    break
                continue

            # commit key tokens
            if (char == ':' and not colon):
                key_token = token
                token = ''
                colon = True
                continue

            # open/close quotes
            if ((char == '"' or char == "'" or char == "`")):
                if (bracket_count == 0):
                    if (open_quote == char):
                        print(f"cq? {char} {escape_char}")
                        if(prevChar != '\\'):
                            open_quote = False
                            if (colon):
                                token += char
                            continue
                        else:
                            token += char
                    open_quote = char
                    if (not colon):
                        continue

            escape_char = False
            if (open_quote and char == '\\' and prevChar != '\\'):
                escape_char = True

            # commit full tokens
            if (char == ','):
                if (not open_quote and bracket_count == 0) :
                    if (key_token != ""):
                        ctx = "global" if brace_count == 0 else current_context
                        self.commit_token(ctx, key_token, package_member, token)
                    key_token = ""
                    token = ""
                    colon = False
                    continue

            if ((char == '(' or char == '[') and not open_quote):
                bracket_count += 1
            if ((char == ')' or char == ']') and not open_quote):
                bracket_count -= 1
            # start contexts
            if (char == '{' and not open_quote and bracket_count == 0):
                if(package_name and not package_start):
                    package_start = True
                    continue
                else:
                    brace_count += 1
                    if (is_func or (colon and token != "")):
                        is_func = True
                        token += char
                        continue
                    if (not package_start):
                        print(f'  ERROR: missing package declaration before "{"{"}"')
                        sys.exit()
                    print(f"open brace: '{token}' {key_token} {current_context}")
                    if (token == "" and key_token != "" and current_context == ""):
                        current_context = key_token
                        colon = False
                        key_token = ""
                        continue
            if (char == '}' and not open_quote and bracket_count == 0):
                if (brace_count == 0):
                    #commit last pair
                    print(f"last brace: '{key_token}', '{token}'")
                    if (key_token != ""):
                        self.commit_token("global", key_token, package_member, token)
                        key_token = ""
                        token = ""
                        current_context = ""
                    print("package end")
                    break
                brace_count -= 1
                if (is_func):
                    token += char
                    if ((brace_count == 0 and current_context == "") or (brace_count == 1 and current_context != "")):
                        is_func = False
                    continue
                if (brace_count == 0):
                    #commit last pair
                    if (key_token != ""):
                        self.commit_token(current_context, key_token, package_member, token)
                    key_token = ""
                    token = ""
                    current_context = ""
                    continue

            token += char

            # start line comments
            if (token == "//"):
                comment = True
                token = ""
                print("comment start")
    
    def writeToFile(self, filename):
        file = open(filename, "w")
        file.write("const " + self._package_name + "={")

        for context, c_members in self.contexts.items():
            file.write('"' + context + '":{')
            for src, targets in c_members.items():
                file.write('"' + src + '":{')
                for member in self._members:
                    target = '""' if (member not in targets) else targets[member]
                    file.write(f'"{member}":{target},')
                file.write("},")
            file.write("},")

        file.write("};")


def __main__():
    pwd = os.path.dirname(os.path.realpath(__file__))

    jspot_file = ""
    jspo_files = []
    for filename in os.listdir(pwd):
        if (filename[-5:] == "jspot"):
            jspot_file = os.path.join(pwd, filename)
        elif (filename[-4:] == "jspo"):
            jspo_files.append(os.path.join(pwd, filename))
    
    if (jspot_file != ""):
        parser = Parser()
        # read jspot
        jspot = open(jspot_file, "r")
        parser.parse_file(jspot)
        # read translations
        for jspo_file in jspo_files:
            jspo = open(jspo_file, "r")
            parser.parse_file(jspo)
        
        parser.writeToFile(os.path.join(pwd, "language-pack.jsmo"))
    

__main__()
