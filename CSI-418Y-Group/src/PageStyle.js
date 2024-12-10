import React from 'react';

const PageStyle = (props) => {
    return(
        <>
        <div style = {{'height':'10%', 'width':'60%', 'background': '#90B27B', 'display': 'flex', 'flex-direction': 'row', 'align-items': 'left', 'justify-content': 'left', 'margin': '0 auto'}}>
            <ul style = {{'list-style-type': 'none', 'margin': '1px', 'padding': '1px', 'display': 'flex', 'flex-direction': 'row'}}>
                <li style={{'background-color': '#ffffff', 'margin': '8px', 'padding': '8px'}}><a href='/Login'>Login</a></li>
                <li style={{'background-color': '#ffffff', 'margin': '8px', 'padding': '8px'}}><a href='/HomePage'>Customer Home</a></li>
                <li style={{'background-color': '#ffffff', 'margin': '8px', 'padding': '8px'}}><a href='/EmployeeHomePage'>Employee Home</a></li>
            </ul>
        </div>
        <div style = {{'display': 'flex', 'flex-direction': 'row', 'align-items': 'center', 'justify-content': 'center', 'background': 'white', 'height':'80vh', 'width': '60%', 'margin': '0 auto', 'vertical-align': 'top'}}>
            {props.children}
        </div>
        </>
    )
}

export default PageStyle