
export default function TagSelectorToBinaryArray(tagArray, fillIfEmpty) {

    var tagIndexes = [];
    for (var i = 0; i < tagArray.length; i++) {
        tagIndexes[i] = tagArray[i].index;
    }
        
    tagIndexes = tagIndexes.sort(function(a, b){return a-b});
    tagIndexes = tagIndexes.filter((item, index) => tagIndexes.indexOf(item) === index);


    var tagArrayIndex = 0;
    const binaryArray = [];
    if (tagIndexes.length === 0 && fillIfEmpty) {
        for (var i = 0; i < 17; i++) {
            binaryArray[i] = 1;
        }
    }
    else {
        for (var i = 0; i < 17; i++) {
            if (i === tagIndexes[tagArrayIndex]) {
                binaryArray[i] = 1;
                tagArrayIndex++;
            }
            else {
                binaryArray[i] = 0;
            }
        }
    }

    return binaryArray;
}