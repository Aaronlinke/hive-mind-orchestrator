import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from './ui/card';

interface TreeNode {
  name: string;
  generation: number;
  fitness: number;
  children?: TreeNode[];
}

interface EvolutionTreeProps {
  agents: any[];
}

export const EvolutionTree = ({ agents }: EvolutionTreeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !agents.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1200;
    const height = 800;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    // Build tree structure
    const generations = Array.from(new Set(agents.map(a => a.generation))).sort((a, b) => a - b);
    const root: TreeNode = {
      name: 'Genesis',
      generation: 0,
      fitness: 1,
      children: []
    };

    generations.forEach(gen => {
      const genAgents = agents.filter(a => a.generation === gen);
      genAgents.forEach(agent => {
        const node: TreeNode = {
          name: agent.agent_name,
          generation: agent.generation,
          fitness: agent.fitness_score || 0,
          children: []
        };
        
        if (gen === 0) {
          root.children!.push(node);
        } else {
          // Try to link to parents
          const parentGen = agents.filter(a => a.generation === gen - 1);
          if (parentGen.length > 0) {
            const parentNode = findNode(root, parentGen[0].agent_name);
            if (parentNode) {
              if (!parentNode.children) parentNode.children = [];
              parentNode.children.push(node);
            } else {
              root.children!.push(node);
            }
          }
        }
      });
    });

    function findNode(node: TreeNode, name: string): TreeNode | null {
      if (node.name === name) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, name);
          if (found) return found;
        }
      }
      return null;
    }

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<TreeNode>()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    const hierarchy = d3.hierarchy(root);
    const treeData = tree(hierarchy);

    // Add links
    const linkGenerator = d3.linkHorizontal<any, any>()
      .x((d: any) => d.y)
      .y((d: any) => d.x);

    svg.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => linkGenerator(d))
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--primary))')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Add nodes
    const nodes = svg.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodes.append('circle')
      .attr('r', (d: any) => 5 + (d.data.fitness || 0) * 5)
      .attr('fill', (d: any) => {
        const hue = (d.data.generation / generations.length) * 360;
        return `hsl(${hue}, 70%, 50%)`;
      })
      .attr('stroke', 'hsl(var(--primary))')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dy', 3)
      .attr('x', (d: any) => d.children ? -12 : 12)
      .attr('text-anchor', (d: any) => d.children ? 'end' : 'start')
      .text((d: any) => `${d.data.name} (Gen ${d.data.generation})`)
      .attr('fill', 'hsl(var(--foreground))')
      .attr('font-size', '12px');

  }, [agents]);

  return (
    <Card className="p-6 bg-background/50 backdrop-blur border-primary/20">
      <h3 className="text-xl font-bold mb-4 text-primary">Evolution Tree</h3>
      <div className="overflow-auto">
        <svg ref={svgRef} className="w-full" />
      </div>
    </Card>
  );
};