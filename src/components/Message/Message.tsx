import React, { FC } from 'react';
import styles from './Message.module.scss';

interface MessageProps {}

const Message: FC<MessageProps> = () => (
  <div className={styles.Message} data-testid="Message">
    Message Component
  </div>
);

export default Message;
