// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }


import { CubeMoveGrammarHelper } from "./CubeMoveGrammarHelper";

const helper = new CubeMoveGrammarHelper();
	

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "program", "symbols": ["repetition_sequence"], "postprocess": id},
    {"name": "repetition_sequence$ebnf$1", "symbols": ["whitespace"], "postprocess": id},
    {"name": "repetition_sequence$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "repetition_sequence$ebnf$2$subexpression$1$ebnf$1", "symbols": []},
    {"name": "repetition_sequence$ebnf$2$subexpression$1$ebnf$1$subexpression$1", "symbols": ["whitespace", "repetition"]},
    {"name": "repetition_sequence$ebnf$2$subexpression$1$ebnf$1", "symbols": ["repetition_sequence$ebnf$2$subexpression$1$ebnf$1", "repetition_sequence$ebnf$2$subexpression$1$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "repetition_sequence$ebnf$2$subexpression$1$ebnf$2", "symbols": ["whitespace"], "postprocess": id},
    {"name": "repetition_sequence$ebnf$2$subexpression$1$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "repetition_sequence$ebnf$2$subexpression$1", "symbols": ["repetition", "repetition_sequence$ebnf$2$subexpression$1$ebnf$1", "repetition_sequence$ebnf$2$subexpression$1$ebnf$2"]},
    {"name": "repetition_sequence$ebnf$2", "symbols": ["repetition_sequence$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "repetition_sequence$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "repetition_sequence", "symbols": ["repetition_sequence$ebnf$1", "repetition_sequence$ebnf$2"], "postprocess": data => helper.repetition_sequence(data)},
    {"name": "repetition$ebnf$1", "symbols": ["non_negative_integer"], "postprocess": id},
    {"name": "repetition$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "repetition$ebnf$2", "symbols": [{"literal":"'"}], "postprocess": id},
    {"name": "repetition$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "repetition", "symbols": ["structure", "repetition$ebnf$1", "repetition$ebnf$2"], "postprocess": data => helper.repetition(data)},
    {"name": "structure", "symbols": ["group"], "postprocess": id},
    {"name": "structure", "symbols": ["conjugate"], "postprocess": id},
    {"name": "structure", "symbols": ["commutator"], "postprocess": id},
    {"name": "structure", "symbols": ["block"], "postprocess": id},
    {"name": "group", "symbols": [{"literal":"("}, "repetition_sequence", {"literal":")"}], "postprocess": data => helper.group(data)},
    {"name": "conjugate", "symbols": [{"literal":"["}, "repetition_sequence", {"literal":"."}, "repetition_sequence", {"literal":"]"}], "postprocess": data => helper.conjugate(data)},
    {"name": "commutator", "symbols": [{"literal":"["}, "repetition_sequence", {"literal":","}, "repetition_sequence", {"literal":"]"}], "postprocess": data => helper.commutator(data)},
    {"name": "block", "symbols": ["range"], "postprocess": id},
    {"name": "block", "symbols": ["slice"], "postprocess": id},
    {"name": "block", "symbols": ["middle"], "postprocess": id},
    {"name": "block", "symbols": ["inlay"], "postprocess": id},
    {"name": "block", "symbols": ["rotation"], "postprocess": id},
    {"name": "range$ebnf$1$subexpression$1", "symbols": ["positive_integer", {"literal":"-"}]},
    {"name": "range$ebnf$1", "symbols": ["range$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "range$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "range$ebnf$2", "symbols": ["positive_integer"], "postprocess": id},
    {"name": "range$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "range", "symbols": ["range$ebnf$1", "range$ebnf$2", /[rufldb]/], "postprocess": data => helper.range(data)},
    {"name": "range$ebnf$3$subexpression$1", "symbols": ["positive_integer", {"literal":"-"}]},
    {"name": "range$ebnf$3", "symbols": ["range$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "range$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "range$ebnf$4", "symbols": ["positive_integer"], "postprocess": id},
    {"name": "range$ebnf$4", "symbols": [], "postprocess": () => null},
    {"name": "range", "symbols": ["range$ebnf$3", "range$ebnf$4", /[RUFLDB]/, {"literal":"w"}], "postprocess": data => helper.range(data)},
    {"name": "slice$ebnf$1", "symbols": ["positive_integer"], "postprocess": id},
    {"name": "slice$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "slice", "symbols": ["slice$ebnf$1", /[RUFLDB]/], "postprocess": data => helper.slice(data)},
    {"name": "middle", "symbols": [/[MES]/], "postprocess": data => helper.middle(data)},
    {"name": "inlay", "symbols": [/[mes]/], "postprocess": data => helper.inlay(data)},
    {"name": "rotation", "symbols": [/[xyz]/], "postprocess": data => helper.rotation(data)},
    {"name": "positive_integer$ebnf$1", "symbols": []},
    {"name": "positive_integer$ebnf$1", "symbols": ["positive_integer$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "positive_integer", "symbols": [/[1-9]/, "positive_integer$ebnf$1"]},
    {"name": "non_negative_integer", "symbols": ["positive_integer"]},
    {"name": "non_negative_integer", "symbols": [{"literal":"0"}]},
    {"name": "whitespace$ebnf$1$subexpression$1", "symbols": [{"literal":" "}]},
    {"name": "whitespace$ebnf$1$subexpression$1", "symbols": [{"literal":"\t"}]},
    {"name": "whitespace$ebnf$1$subexpression$1", "symbols": [{"literal":"\n"}]},
    {"name": "whitespace$ebnf$1$subexpression$1", "symbols": [{"literal":"\r"}]},
    {"name": "whitespace$ebnf$1", "symbols": ["whitespace$ebnf$1$subexpression$1"]},
    {"name": "whitespace$ebnf$1$subexpression$2", "symbols": [{"literal":" "}]},
    {"name": "whitespace$ebnf$1$subexpression$2", "symbols": [{"literal":"\t"}]},
    {"name": "whitespace$ebnf$1$subexpression$2", "symbols": [{"literal":"\n"}]},
    {"name": "whitespace$ebnf$1$subexpression$2", "symbols": [{"literal":"\r"}]},
    {"name": "whitespace$ebnf$1", "symbols": ["whitespace$ebnf$1", "whitespace$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "whitespace", "symbols": ["whitespace$ebnf$1"]}
  ],
  ParserStart: "program",
};

export default grammar;
