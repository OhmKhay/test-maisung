
    let receiverID;
    const socket = io();

    let generateID = `${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}-${Math.trunc(Math.random()*999)}`
    
    document.querySelector("#sender-start-con-btn").addEventListener("click",function(){
        let joinID = generateID;
        document.querySelector("#join-id").innerHTML = `<h3>Group ID</h3><span>${joinID}</span>`;
        socket.emit("sender-join",{
            uid: joinID
        });
        socket.on("init",function(uid){
            receiverID = uid;
            document.querySelector(".join-screen").classList.remove("active");
            document.querySelector(".fs-screen").classList.add("active");
        });
        document.querySelector("#file-input").addEventListener("change",function(e){
            let file = e.target.files[0];
            if(!file){
                return;
            }
            let reader = new FileReader();
            reader.onload = function(e){
                let buffer = new Uint8Array(reader.result);
                let el = document.createElement("div");
                el.classList.add("item");
                el.innerHTML = `<div class="prograss">0%</div>
                <div class="filename">${file.name}</div>`;
                document.querySelector(".file-list").appendChild(el);
                shareFile({
                    filename:file.name,
                    total_buffer_size:buffer.length,
                    buffer_size:1024
                },buffer,el.querySelector(".prograss"));
            }
            reader.readAsArrayBuffer(file);
        });
        function shareFile(metadata,buffer,prograss_node){
            socket.emit("file-meta",{
                uid:receiverID,
                metadata:metadata
            });
            socket.on("fs-share",function(){
                let chunk = buffer.slice(0,metadata.buffer_size);
                buffer = buffer.slice(metadata.buffer_size,buffer.length);
                prograss_node.innerText = Math.trunc((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100)+"%";
                if(chunk.length !=0){
                    socket.emit("file-raw",{
                        uid:receiverID,
                        buffer:chunk
                    })
                }
            })
        }
    })
