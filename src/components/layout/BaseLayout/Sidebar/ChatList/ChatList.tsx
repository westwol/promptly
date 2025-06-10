export const ChatList = () => {
  return (
    <div>
      <div>
        <p className="text-white">Search</p>
      </div>
      <ul className="flex flex-col gap-2 text-white">
        <li className="p-2 hover:bg-red-950 rounded-sm text-sm">
          New chat created
        </li>
        <li className="p-2 hover:bg-red-950 rounded-sm text-sm">
          New chat created 2
        </li>
      </ul>
    </div>
  );
};
