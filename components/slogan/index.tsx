import classNames from 'classnames';
import styles from './slogan.module.scss';

export default function Slogan({ className }: { className?: string }) {
  return (
    <div className={classNames(styles.slogan, className)}>
      You are more than what you have become!
    </div>
  );
}
