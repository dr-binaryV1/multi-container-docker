import React from 'react'
import { Link } from 'react-router-dom'

const main = () => {
  return (
    <div>
      Im some other page!
      <Link to={"/"}>Go back to home</Link>
    </div>
  )
}

export default main