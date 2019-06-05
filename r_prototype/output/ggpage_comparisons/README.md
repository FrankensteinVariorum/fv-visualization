# ggpage_comparisons

Very sketchy implementation of an idea to set a given "reference" witness, and then visualize how other witnesses have either additions to their apps or deletions in relation to the selected witness.

- blue: to get to the target witness from the reference witness, the target witness has **added** words in that app
- red: to get to the reference witness from the target witness, you'd need to **delete** words

The visual layout is a pseudo-typesetting created by the [ggpage](https://github.com/EmilHvitfeldt/ggpage) R package. 
This bears NO relation to any of the layout/formatting info in the TEI, it's just an experiment to create a visual that captures more of the comparative word lengths of the apps. 
In order to communicate relative app size, the space taken up by any of the pseudo-text chunks are generated based on the actual character counts of words in the apps.
