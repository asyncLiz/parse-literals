import * as ts from 'typescript';
import { Strategy, TemplatePart } from '../models';

export interface TypescriptStrategy extends Strategy<ts.Node> {
  walkChildNodes(node: ts.Node, visit: (node: ts.Node) => void): void;
  getHeadTemplatePart(node: ts.TemplateLiteral | ts.TemplateHead): TemplatePart;
  getMiddleTailTemplatePart(
    node: ts.TemplateMiddle | ts.TemplateTail
  ): TemplatePart;
}

let currentRoot: ts.SourceFile | undefined;
export default <TypescriptStrategy>{
  getRootNode(source: string, fileName: string = ''): ts.SourceFile {
    return ts.createSourceFile(fileName, source, ts.ScriptTarget.ESNext);
  },
  walkNodes(root: ts.SourceFile, visit: (node: ts.Node) => void) {
    currentRoot = root;
    this.walkChildNodes(root, visit);
    currentRoot = undefined;
  },
  walkChildNodes(node: ts.Node, visit: (node: ts.Node) => void) {
    visit(node);
    ts.forEachChild(node, child => {
      this.walkChildNodes(child, visit);
    });
  },
  isTaggedTemplate: ts.isTaggedTemplateExpression,
  getTagText(node: ts.TaggedTemplateExpression): string {
    return node.tag.getText(currentRoot);
  },
  getTaggedTemplateTemplate(
    node: ts.TaggedTemplateExpression
  ): ts.TemplateLiteral {
    return node.template;
  },
  isTemplate: ts.isTemplateLiteral,
  getTemplateParts(node: ts.TemplateLiteral): TemplatePart[] {
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      // "`string`"
      return [this.getHeadTemplatePart(node)];
    } else {
      return [
        // "`head${" "}middle${" "}tail`"
        this.getHeadTemplatePart(node.head),
        ...node.templateSpans.map(templateSpan =>
          this.getMiddleTailTemplatePart(templateSpan.literal)
        )
      ];
    }
  },
  getHeadTemplatePart(node: ts.TemplateLiteral | ts.TemplateHead) {
    let fullText = node.getFullText(currentRoot);
    let startOffset = 1;
    while (fullText.startsWith(' ')) {
      fullText = fullText.slice(1);
      startOffset++;
    }

    const endOffset = ts.isTemplateHead(node) ? -2 : -1;
    return {
      text: fullText.slice(1, fullText.length + endOffset),
      start: node.pos + startOffset,
      end: node.end + endOffset
    };
  },
  getMiddleTailTemplatePart(node: ts.TemplateMiddle | ts.TemplateTail) {
    const fullText = node.getFullText(currentRoot);
    const endOffset = ts.isTemplateMiddle(node) ? 2 : 1;
    return {
      text: fullText.slice(1, fullText.length - endOffset),
      start: node.pos + 1,
      end: node.end - endOffset
    };
  }
};
