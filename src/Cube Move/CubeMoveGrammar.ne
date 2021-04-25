# If you change anything you need to run:
# node node_modules/nearley/bin/nearleyc.js 'src/Cube Move/CubeMoveGrammar.ne' -o 'src/Cube Move/CubeMoveGrammar.ts'

@preprocessor typescript

program -> repetition_sequence {% id %}

# Repetitions
repetition_sequence -> whitespace:? (repetition (whitespace repetition):* whitespace:?):? {% data => helper.repetition_sequence(data) %}
repetition          -> structure non_negative_integer:? "'":?                             {% data => helper.repetition(data) %}

# Structures
structure  -> group                                               {% id %}
			| conjugate                                           {% id %}
			| commutator                                          {% id %}
			| block                                               {% id %}
group      -> "(" repetition_sequence ")"                         {% data => helper.group(data) %}
conjugate  -> "[" repetition_sequence "." repetition_sequence "]" {% data => helper.conjugate(data) %}
commutator -> "[" repetition_sequence "," repetition_sequence "]" {% data => helper.commutator(data) %}

# Blocks
block    -> range                                                    {% id %}
		  | slice                                                    {% id %}
		  | middle                                                   {% id %}
		  | inlay                                                    {% id %}
		  | rotation                                                 {% id %}
range    -> (positive_integer "-"):? positive_integer:? [rufldb]     {% data => helper.range(data) %}
		  | (positive_integer "-"):? positive_integer:? [RUFLDB] "w" {% data => helper.range(data) %}
slice    -> positive_integer:? [RUFLDB]                              {% data => helper.slice(data) %}
middle   -> [MES]                                                    {% data => helper.middle(data) %}
inlay    -> [mes]                                                    {% data => helper.inlay(data) %}
rotation -> [xyz]                                                    {% data => helper.rotation(data) %}

# Basics
positive_integer     -> [1-9] [0-9]:*
non_negative_integer -> positive_integer | "0"
whitespace           -> (" " | "\t" | "\n" | "\r"):+

@{%

import { CubeMoveGrammarHelper } from "./CubeMoveGrammarHelper";

const helper = new CubeMoveGrammarHelper();
	
%}