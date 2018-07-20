import { Template, Strategy } from './models';
import typescript from './strategies/typescript';

export interface ParseLiteralsOptions {
  fileName?: string;
  strategy?: Strategy<any>;
}

export function parseLiterals(
  source: string,
  options: ParseLiteralsOptions = {}
): Template[] {
  if (!options.strategy) {
    options.strategy = typescript;
  }

  const { strategy } = options;
  const literals: Template[] = [];
  const visitedTemplates: any[] = [];
  strategy.walkNodes(strategy.getRootNode(source, options.fileName), node => {
    if (strategy.isTaggedTemplate(node)) {
      const template = strategy.getTaggedTemplateTemplate(node);
      visitedTemplates.push(template);
      literals.push({
        tag: strategy.getTagText(node),
        parts: strategy.getTemplateParts(template)
      });
    } else if (strategy.isTemplate(node) && !visitedTemplates.includes(node)) {
      literals.push({
        parts: strategy.getTemplateParts(node)
      });
    }
  });

  return literals;
}
