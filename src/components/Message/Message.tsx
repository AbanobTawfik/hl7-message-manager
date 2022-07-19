import React, { FC } from 'react';
import styles from './Message.module.scss';
import message from '../../types/message.ts'
import message_icon from '../../resources/Icons/message.png'
export function Message({ message }){

 return( <div className={styles.Message} data-testid="Message">
    <img className="img-fluid" src={message_icon} />
      {message.description}

  </div>
);
}

export default Message;
