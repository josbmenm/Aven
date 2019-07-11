import React from 'react'
import { MjmlText } from 'mjml-react'

function Text({ fontFamily = "Lora", ...rest}) {
  return <MjmlText fontFamily={fontFamily} {...rest} />
}

export default Text;
