const graph = {};
const nodes = new vis.DataSet();
const edges = new vis.DataSet();
const container = document.getElementById("network");

const data = { nodes, edges };
const options = { 
    nodes: { shape: "dot", size: 15, color: "skyblue" }, 
    edges: { color: "gray" },
    physics: { enabled: true },
    interaction: { hover: true, dragNodes: true },
    manipulation: { enabled: true }
};
const network = new vis.Network(container, data, options);

function addEdge() {
    const u = document.getElementById("node1").value.trim();
    const v = document.getElementById("node2").value.trim();

    if (u && v) {
        if (!graph[u]) graph[u] = [];
        if (!graph[v]) graph[v] = [];
        graph[u].push(v);
        graph[v].push(u);

        nodes.update({ id: u, label: u });
        nodes.update({ id: v, label: v });
        edges.add({ from: u, to: v });

        document.getElementById("node1").value = "";
        document.getElementById("node2").value = "";
    } else {
        alert("Veuillez entrer les deux sommets.");
    }
}

function clearGraph() {
    nodes.clear();
    edges.clear();
    Object.keys(graph).forEach(key => delete graph[key]);
    document.getElementById("articulationPointsList").innerHTML = "";
}

function findArticulationPoints() {
    const visited = {};
    const depth = {};
    const low = {};
    const parent = {};
    const articulationPoints = new Set();
    let time = 0;

    function dfs(u) {
        visited[u] = true;
        depth[u] = low[u] = ++time;
        let children = 0;

        for (const v of graph[u] || []) {
            if (!visited[v]) {
                parent[v] = u;
                children++;
                dfs(v);

                low[u] = Math.min(low[u], low[v]);
                if (parent[u] === undefined && children > 1) {
                    articulationPoints.add(u);
                }
                if (parent[u] !== undefined && low[v] >= depth[u]) {
                    articulationPoints.add(u);
                }
            } else if (v !== parent[u]) {
                low[u] = Math.min(low[u], depth[v]);
            }
        }
    }

    for (const node in graph) {
        if (!visited[node]) {
            dfs(node);
        }
    }

    displayArticulationPoints(articulationPoints);
    nodes.update(nodes.map(node => ({
        id: node.id,
        color: articulationPoints.has(node.id) ? "red" : "skyblue"
    })));
}

function displayArticulationPoints(articulationPoints) {
    const list = document.getElementById("articulationPointsList");
    list.innerHTML = "";
    if (articulationPoints.size > 0) {
        articulationPoints.forEach(point => {
            const listItem = document.createElement("li");
            listItem.textContent = point;
            listItem.classList.add("result-item");
            list.appendChild(listItem);
        });
    } else {
        list.innerHTML = "<li>Aucun point d'articulation trouvé.</li>";
    }
}