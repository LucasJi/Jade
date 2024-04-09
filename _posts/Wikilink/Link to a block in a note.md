A block is a unit of text in your note, for example a paragraph, block quote, or even a list item.

You can link to a block by adding `#^` at the end of your link destination followed by a unique block identifier, for example, `[[2023-01-01#^37066d]]`.

Fortunately, you don't need to know the identifier. When you type the caret (`^`), you can select the block from a list of suggestions to insert the right identifier. 

You can also create human-readable block identifiers by adding a blank space followed by the identifier, for example `^quote-of-the-day`, at the end of a block:

```md
"You do not rise to the level of your goals. You fall to the level of your systems." by James Clear ^quote-of-the-day
```

Now you can instead link to the block by typing `[[2023-01-01#^quote-of-the-day]]`.

Block identifiers can only consist of Latin letters, numbers, and dashes.

## Examples

### Link to a block

[[Demo#^cac03d]]

### Link to a block by the identifier

[[Demo#^heading-1-1-block-identifier]]
