

const Landing = () => {
  return (
    <div className="h-screen bg-zinc-500 text-white flex items-center justify-center">
      <div className="flex flex-col h-100 w-100 bg-zinc-700 justify-center p-5 gap-4 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className=" font-bold">Chat App</h1>
          <p >Join room and start chatting!</p>
        </div>
        
        <div>
          <form> 
            <div className="flex flex-col">
              <label>
                <p className="mt-4 mb-2">Username</p>
                <input type="text" placeholder="Enter your name" className="p-3 border-none w-full rounded"/>
              </label>
              <label>
                <p className="mt-4 mb-2">Room-Id</p>
                <input type="text" placeholder="Room-id"  className="p-3 border-none w-full rounded"/>
              </label>
            </div>
          </form>
          <div className="text-center justify-center bg-[#607785] mt-5 p-4 cursor-pointer hover:bg-[#404859] rounded">
              <button className="" onClick={(e)=>{
                e.preventDefault()
                console.log("done")
              }}> Join Room -</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing