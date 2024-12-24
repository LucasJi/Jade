import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/utils';
import { CalendarCheck, CalendarSync, Tags } from 'lucide-react';
import { HTMLAttributes, forwardRef } from 'react';

interface FrontmatterProps extends HTMLAttributes<HTMLDivElement> {
  frontmatter: string;
}

const Frontmatter = forwardRef<HTMLDivElement, FrontmatterProps>(
  ({ className, children, frontmatter, ...props }, ref) => {
    const fontSize = 16;
    const { created, modified, tags } = JSON.parse(frontmatter);
    return (
      <div ref={ref} className={cn(className)} {...props}>
        {created && (
          <div className="flex items-center justify-start text-muted-foreground">
            <CalendarCheck size={fontSize} />
            <span className="ml-2">{created}</span>
          </div>
        )}
        {modified && (
          <div className="flex items-center justify-start text-muted-foreground">
            <CalendarSync size={fontSize} />
            <span className="ml-2">{modified}</span>
          </div>
        )}
        {tags && (
          <div className="flex items-center justify-start text-muted-foreground">
            <Tags size={fontSize} />
            <div className="ml-2">
              {tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default Frontmatter;
