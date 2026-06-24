import { Card, CardContent, CardHeader } from "@mui/material";

interface Props {
  title?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const CustomCard: React.FC<Props> = ({ title, children, action, className }) => {
  return (
    <Card className={`w-full`}>
      {title && <CardHeader title={title} action={action} />}
      <CardContent className={`${className}`}>{children}</CardContent>
    </Card>
  );
};

export default CustomCard;
