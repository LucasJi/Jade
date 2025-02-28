import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/utils';
import { CalendarCheck, CalendarSync, Tags } from 'lucide-react';
import { HTMLAttributes, forwardRef } from 'react';

interface FrontmatterProps extends HTMLAttributes<HTMLDivElement> {
  frontmatter: string;
}

const Frontmatter = forwardRef<HTMLDivElement, FrontmatterProps>(
  ({ className, children, frontmatter, ...props }, ref) => {
    const fontSize = 14;
    const { created, modified, tags } = JSON.parse(frontmatter);
    return (
      <div ref={ref} className={cn('text-sm', className)} {...props}>
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
            <div>
              {tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="ml-2 font-light"
                >
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
