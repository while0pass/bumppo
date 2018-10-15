export default function linearizeTree(node, treeLinearForm, isFirstChild=true) {
  var depth = node.depth(),
      levels = linearizeTree.levels;
  if (depth == 0) {
    levels = linearizeTree.levels = [0];
    linearizeTree.serialNumber = 1;
  } else if (depth !== 0 && !(levels instanceof Array)) {
    throw 'Нарушена правильная работа функции линеаризации дерева';
  } else if (isFirstChild) {
    levels.push(0);
  } else if (levels.length === depth + 1) {
    levels[levels.length - 1] += 1;
  } else {
    let mx = Math.max(...levels.slice(depth));
    levels.splice(depth);
    levels[depth] = mx + 1;
  }
  node.level(levels.slice(-1)[0]);
  node.serialNumber(linearizeTree.serialNumber);
  linearizeTree.serialNumber += 1;
  treeLinearForm.push(node);
  if (node.childNodes().length > 0) {
    for (let i = 0; i < node.childNodes().length; i++) {
      let childNode = node.childNodes()[i],
          isFirstChild = i == 0;
      treeLinearForm = linearizeTree(childNode, treeLinearForm, isFirstChild);
    }
  }
  return treeLinearForm;
}
