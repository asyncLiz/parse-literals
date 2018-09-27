import * as ts from 'typescript';
import { Strategy, TemplatePart } from '../models';

export interface TypescriptStrategy extends Strategy<ts.Node> {
  walkChildNodes(node: ts.Node, visit: (node: ts.Node) => void): void;
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
      let fullText = node.getFullText(currentRoot);
      let startOffset = 1;
      while (fullText.startsWith(' ')) {
        fullText = fullText.slice(1);
        startOffset++;
      }

      // "`string`"
      return [
        {
          text: fullText.slice(1, fullText.length - 1),
          start: node.pos + startOffset,
          end: node.end - 1
        }
      ];
    } else {
      const headFullText = node.head.getFullText(currentRoot);
      return [
        // "`head${" "}middle${" "}tail`"
        {
          text: headFullText.slice(1, headFullText.length - 2),
          start: node.head.pos + 1,
          end: node.head.end - 2
        },
        ...node.templateSpans.map(templateSpan => {
          const literal = templateSpan.literal;
          const literalFullText = literal.getFullText(currentRoot);
          const endOffset = ts.isTemplateMiddle(literal) ? 2 : 1;
          return {
            text: literalFullText.slice(1, literalFullText.length - endOffset),
            start: literal.pos + 1,
            end: literal.end - endOffset
          };
        })
      ];
    }
  }
};
