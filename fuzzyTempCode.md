in SearchBar.tsx

```javascript
// get show text for text that matches the input value, if it exists
let items = [];
if (matches) {
  let bodyTextMatching = matches.filter((match) => match.key === "text");
  if (bodyTextMatching.length > 0) {
    const value = bodyTextMatching[0].value;
    let currIdx = 0;
    for (let interval of bodyTextMatching[0].indices) {
      if (currIdx >= value.length) {
        break;
      }
      // interval comes in flavors like [1,1], [5,5], [6, 8] - Fuse.js puts them as inclusive intervals
      // but javascript substring is from start to end, not including end
      // so we need to build a list of bolded characters that are within each interval (inclusive)
      items.push(<span>{value.substring(currIdx, interval[0])}</span>);
      items.push(<b>{value.substring(interval[0], interval[1] + 1)}</b>);

      // set pointer to the one after
      currIdx = interval[1] + 1;
    }
    // add rest of lyrics
    if (currIdx < value.length) {
      items.push(<span>{value.substring(currIdx)}</span>);
    }
  } else {
    items.push(<span>{song.text.slice(0, 200)}</span>);
  }

  // let nameMatching = matches.filter(match => match.key === "name")
  // if (nameMatching.length > 0) {
  //   const nameValue = nameMatching[0].value;

  // }
}
const showText = (
  <Text as="p" mt="4px" fontSize="13px">
    <div>{items}</div>
  </Text>
);
```
