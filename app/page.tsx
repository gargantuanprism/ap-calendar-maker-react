import EventParser from '../lib/event-parser'

function renderIcon(e){
  if (e.svgIcon){
    return <div className="icon" style={{fill: e.color}} dangerouslySetInnerHTML={{__html: e.svgIcon}} />
  }

  return <img className="icon" src={e.imageIcon} />
}

export default async function Home() {
  const eventParser = new EventParser();
  const {pages, info} = await eventParser.parse();

  return (
    <div>
      {pages.map((page, index) => (
        <div key={index} className="grid-container">
          {page.map((e, index) => (
            <div key={index} className="grid-row" style={{color: e.color}}>
              <div className="grid-item">
                <div className="small">{e.dow}</div>
                <div className="day bold">{e.day}</div>
              </div>
              <div className="grid-item">{renderIcon(e)}</div>
              <div className="grid-item event-title">
                <div className="type small">{e.type}</div>
                <div className="name bold" style={{fontSize: e.size}}>{e.name}</div>
              </div>
              <div className="grid-item time bold">
                <div>{e.start}</div>
                <div>{e.end}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

