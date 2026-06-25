import type { CardProps } from "@mui/material";
import { Card, CardContent, CardHeader } from "@mui/material";

interface Props extends CardProps {
  title?: React.ReactNode | any;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const CustomCard: React.FC<Props> = ({ title, children, action, className, ...props }) => {
  return (
    <Card className={`w-full `} {...props}>
      {title && <CardHeader title={title} action={action} className={`${className}`} />}
      <CardContent className={`${className}`}>{children}</CardContent>
    </Card>
  );
};

export default CustomCard;
