import React, { FC } from 'react';
import styles from './Message.module.scss';
import message from '../../types/message.ts'
import message_icon from '../../resources/Icons/message.png'


interface MessageProps { message: message }

const Message: FC<MessageProps> = ({ message }) => (
  <div className={styles.Message} data-testid="Message">
    <img className="img-fluid" src={message_icon} />
      <div >{message.description}</div>

      <div className='text'>{message.description}</div>
  </div>
);

export default Message;
