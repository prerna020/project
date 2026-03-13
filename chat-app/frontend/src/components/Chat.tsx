import React from 'react'

const Chat = () => {
  return (
    <div className=' flex flex-col h-screen bg-black text-white'>
      <div className=' flex bg-zinc-400 w-full h-20 justify-between p-6'>
        <div className='font-bold text-2xl'>Room-Id: </div>
        <div>Connected</div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 '>
        Message
      </div>

      <div className='bg-zinc-600 p-4'>
        <div>
          <form className='flex flex-row gap-8'>
            <input type="text" placeholder='Message...' className='w-full p-3 rounded-2xl' />
            <button className='bg-black p-4 rounded-2xl hover:bg-zinc-800'>Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat