---
title: "Basic Computational Economics"
date: "2022-06-05"
cover: https://imagedelivery.net/EipKtqu98OotgfhvKf6Eew/c04c8e28-4139-4e22-b2d5-88f7dbf24600/public
categories: 
  - "Simulation"
  - "Topic > Finance"
---

## Why agent-based modeling?

_Computational economics_ is the study of using software-based methods to gain extra insight into economic problems. [Agent-based modeling](https://hash.ai/glossary/agent-based-modeling) involves using computer simulations to model intelligent agents and how they behave.

For many problems, economic theory only describes what a system is like under 'perfect' conditions, which makes it hard to apply models to real-life situations. Agent-based modeling may help fill the gap, by reducing the number of assumptions economists have to make.

In this article we'll cover:

- basic concepts of supply and demand, starting with very basic agents on a 2D grid that respond to changing prices

- basic game theory, and modeling how agents cooperate with each other (or not)

- basic trade and price modeling, exploring how agents can generate second-order effects from simple rules.

- an example model of an interconnected call center, which demonstrates agents connected to each other in a networked fashion

- an example geospatial model, showing how to use real-life data in a simulation.

We’ll be using JavaScript to explore these introductory concepts in computational economics, specifically around agent-based modelling. By the end of the article you should have a sense of how to use [hCore](https://hash.ai/platform/core) for agent-based projects of your own.

## HASH primitives

The building blocks of the HASH platform are **agents**, **behaviors**, **state**, and **context**.

In agent-based modeling you describe (through computer code) 'rules' that individual agents within a virtual environment each follow, rather than formulas which describe the dynamics of the system as a whole. This allows for complex interactions to emerge from basic rules. In HASH, we call these rules **behaviors**.

Each agent can have multiple behaviors, each of which is outlined by a standardized function in a seperate js file. The behavior takes in standardized variables as in the example below.

```
const behavior = (state, context) => {
  state.age += 1;
}
```

The behavior takes in a mutable **state** for the specific agent and an immutable **context**.

Each agent on the HASH platform has a private state that can contain any fields that you want. The state object can be accessed as an object in JavaScript or a dictionary in Python.

Changing the state can change the 3D appearance of an agent, using [reserved fields](https://hash.ai/docs/simulation/creating-simulations/anatomy-of-an-agent/state).

```
const behavior = (state, context) => {
    state.messages.push({
        to: "schelling",
        type: "data_point",
        data: {
            num_agents: 50
        }
    });
}
```

States also have the ability to send messages to other agents**,** as in the example above.

## Topologies

Agents in HASH have an in-built capacity for communicating with neighbors. Internally, the HASH simulation, [hEngine](https://hash.ai/platform/engine) -- which also powers [hCore](https://hash.ai/platform/core) -- maintains a list of neighbors for each agent and updates the list with each time step. Neighbors can be accessed via the context variable as in the example code below.

```
function behavior(state, context) {
    const neighbors = context.neighbors()

    for (const neighbor of neighbors) {
        ...
    }

    // OR

    neighbors.forEach(n => {
        ...
    });
}
```

The **topology** defined in a simulations' `globals.json` file can tell us about how the **agents**' **neighbors** are found. For example, the `search_radius` tells us how far away the engine should look to find **neighbors**. It is recommended to use HASH's in-built functionality to find neighbors, as it is hardware accelerated and can handle thousands of agents.

## Supply and demand

In economics, the _Law of Supply and Demand_ describes the willingness of an agent -- buyer or seller -- to make a transaction. More concretely,

- The law of supply states that, the higher the price, the more product producers are willing to sell.

- The law of demand states that, the lower the price, the more product consumers are willing to buy.

We can create simulations that [show how these laws](https://core.hash.ai/@hash/model-market/4.5.1) apply in practice, both when markets are at equilibrium and as they fluctuate.

### Model market simulation

The simulation contains agents (shops) that set their prices in competition with other shops. The simulation will also have buyers that buy only from shops that have the lowest price. Competition between agents leads to emergent behavior according to the laws of supply and demand.

- The pink agents represent buyers, moving from square to square to interact with shops.

- The blue agents represent open shops, that change their prices in response to buyers.

- The white agents represent closed shops.

Press the running man play button in the simulation below to see it in action.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Fmodel-market&amp;ref=stable&amp;tabs=3d" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

This is a relatively simplistic toy model, and all of the behaviors of a shop are outlined in `shop.js` and of buyers in `buyer.js`.

In this simulation, the simple shops and buyers interact with each other using HASH's in-built system for handling neighbors.

The shops and buyers are placed in 3D space by the scripts `create_shops.js` and `create_buyers.js`.

### Simulating demand

In our toy model, the behavioral logic in `shops.js` governs the supply-side, allowing shop to open, close, and adjust their prices in response to buyers.

At the most basic level, if the cost of running the store exceeds the retail price of items, the shop closes down. White squares represent closed shops, so the state color is changed to white.

```
function shutDownClosed(state, context){
  // Cost exceeds price, so shut down
  if (state.cost > state.price) {
    state.color = "white";
  }
  return state;

}
```

Later on in `shops.js`, we provide closed shops with a (randomly determined) chance of re-opening.

```
function reOpenClosed(state, globals){
  // Random chance for new shop to open
  state.color = Math.random() < globals.startup_rate ? "skyblue" : "white";

  // If the shop is now open, set random price and cost
  if (state.color === "skyblue") {
    state.price = Math.floor(Math.random() * globals.max_price) + globals.min_price;
    state.cost = Math.floor(Math.random() * globals.max_cost) + globals.min_cost;
  }
}
```

Shops will reduce their prices if there isn't enough demand. Other parts of the `shop.js` script deal with lowering prices to attract buyer agents.

```
function lowerPrices(current_buyers, state){
  // If open and there was a sale last step (green)
  // but no sale this step
  if (current_buyers === 0) {
    // chance to lower price
    state.price *= Math.random() < 0.1 ? 0.85 : 1;

    if (Math.random() < 0.01) {
      state.color = "skyblue";
    }
  }
}
```

### Window shopping

Lets take a look at the behaviors defined inside `buyer.js`.

We can see that every buyer agent takes stock of its given location and looks around all the neighboring squares to see the lowest price.

```
function windowShop(current_shop, state){
  // Window Shopping: look for the lowest price
  if (current_shop.color !== "white" && !state.can_buy) {
    state.window_shopping_counter -= 1;
    if (state.lowest_price === 0) {
      state.lowest_price = current_shop.price;
    } else {
      // Set a new lowest price if its lower
      state.lowest_price = current_shop.price < state.lowest_price
          ? current_shop.price
          : state.lowest_price;
    }
  }
}
```

The model allows for more complex behavior, such as waiting for a period of time to get the best price.

```
function count_shopping(state, window_shopping_steps){
  // Once my window shopping time runs out I can try and buy
  if (state.window_shopping_counter === 0) {
    state.can_buy = true;
    state.window_shopping_counter =
      Math.floor(Math.random() * window_shopping_steps) + 1;
  }
}
```

### 3D simulation

This simulation works by creating agents in 3D space along a 2D grid. The buyer agents are given a height of 4 to make them easy to spot, and placed randomly in 2D space, as we can see in `create_buyers.js` below.

```
function behavior (state, context) {
  const {
    buyer_count,
    topology,
    window_shopping_steps,
  } = context.globals();

  const width = topology.x_bounds[1] - topology.x_bounds[0];
  const height = topology.y_bounds[1] - topology.y_bounds[0];

  // Create agent definitions for generating later
  state.agents["buyers"] = Array(buyer_count)
    .fill()
    .map((_val, id) => ({
      position: [ Math.floor(Math.random() * width), Math.floor(Math.random() * height)],
      color: "violet",
      purchased: false,
      can_buy: false,
      window_shopping_counter:
        Math.floor(Math.random() * window_shopping_steps) + 1,
      lowest_price: 0,
      height: 4,
      behaviors: ["buyer.js", "@hash/random-movement/random_movement.rs"]
    }));
}
```

The `create_shops.js` script is similar, in that it generates shops rather than buyers. The shops are placed in an array, each with an associated cost and a price of items.

```
function behavior (state, context) {
  const {
    topology,
    max_price,
    min_price,
    max_cost,
    min_cost,
  } = context.globals();

  const width = topology.x_bounds[1] - topology.x_bounds[0];
  const height = topology.y_bounds[1] - topology.y_bounds[0];

  /** This function generates a shop agent */
  const create_shops = (id, color, price, cost) => ({
    position: [id % width, Math.floor(id / width)],
    color,
    cost,
    price,
    height: 2,
    behaviors: ["shop.js"]
  });

  // Store a set of shop agents for generating later
  state.agents["shops"] = Array(width * height)
    .fill()
    .map((_val, id) => {
      const cost = Math.floor(Math.random() * max_cost) + min_cost;
      const price = Math.floor(Math.random() * max_price) + min_price;
      const color = cost > price ? "white" : "skyblue";
      return create_shops(id, color, price, cost);
    });
};
```

### Analysis view

HASH allows users to set up views and analytics to understand better how the simulation is going. In this example, HASH outputs graphs related to the shops sales and pricing. Let's take a look at `analysis.json`.

```
  "plots": [
    {
      "title": "Shop Status",
      "timeseries": ["no_recent_sales", "recent_sales", "closed"],
      "layout": {"width": "100%", "height": "40%"},
      "position": {"x": "0%", "y": "0%"}
    },
    {
      "title": "Average Lowest Price",
      "timeseries": ["avg_lowest_price"],
      "layout": {"width": "100%", "height": "40%"},
      "position": {"x": "0%", "y": "40%"}
    }
  ]
```

Here, the output is a timeseries plot of the variable `avg_lowest_price`, the average lowest price in the shops of the simulation.

We can experiment with changing global parameters to understand the model a bit better. Let's take a look at changing the global variables in the simulation below. **Click on the analysis tab below to learn more.** If you press _run_ on the simulation, the graph will start generating output.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Fmodel-market&amp;ref=stable&amp;tabs=analysis" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

We can see the output of the graphs changes in response to changing globals. For example, if we change the `max_price` to 25, the curves we get change significantly. Try it yourself -- see how the curves change in response to different global variables.

## Game Theory

Game theory is a branch of mathematics that deals with models of rational decision-makers. It is used by mathematicans and economists to improve real-world decision making and solve problems of co-operation and co-ordination.

This section of the course will teach you how to model one specific problem in Game Theory, the Prisoner's Dilemma. [View the Prisoner's Dilemma simulation >](https://core.hash.ai/@hash/prisoners-dilemma/7.0.0)

The dilemma is as follows:

> Two members of a criminal organization are arrested and imprisoned. Each prisoner is in solitary confinement with no means of communicating with the other. The prosecutors lack sufficient evidence to convict the pair on the principal charge, but they have enough to convict both on a lesser charge. Simultaneously, the prosecutors offer each prisoner a bargain. Each prisoner is given the opportunity either to betray the other by testifying that the other committed the crime, or to cooperate with the other by remaining silent. The possible outcomes are:
> 
> 1\. If A and B each betray the other, each of them serves two years in prison (both **defect**)
> 
> 2\. If A betrays B but B remains silent, A will be set free and B will serve three years in prison (A **defects**, B **cooperates**)
> 
> 3\. If A remains silent but B betrays A, A will serve three years in prison and B will be set free (A **cooperates**, B **defects**)
> 
> 4\. If A and B both remain silent, both of them will serve only one year in prison (both **cooperate**).
> 
> [Wikipedia](https://en.wikipedia.org/wiki/Prisoner%27s_dilemma)

The strategies outlined are known as **cooperate** and **defect**.

The Prisoner's Dilemma is an example of a decision-making problem where agents have to optimize for the best outcome. HASH can be used to model outcomes and come up with new insights into why agents behave the way that they do. With different parameters, the same simulation can be forked used to model other coordination problems, such as a game of chicken.

### Iterated Prisoner's Dilemma Simulation

Our simulation initializes agents in a grid. At each time step, each agent will play against its immediate neighbours using a strategy. **Press the running man play button in the simulation below to see it in action.**

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Fprisoners-dilemma&amp;ref=stable" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

At each time step, agents decide whether to cooperate or defect with their neighbors.

At each time step agents also have a chance to change their strategy, depending on their performance in the previous game.

The different strategies are color-coded, making it clear which strategies are winning (gaining market-share) as well as which ones are dying out.

The code in the HASH simulation above calculates the outcome for the iterated Prisoner's Dilemma. We can now start thinking about strategy, and when it might make sense to cooperate.

### Cooperate or defect?

Lets model the Prisoner's Dilemma more abstractly by considering two agents, **A** and **B**, who at each time step can either co-operate or defect.

We can model a strategy in HASH through writing a [behavior](https://hash.ai/docs/simulation/creating-simulations/behaviors). Behaviors in HASH are functions attached to agents called at every time step. Behaviors take in the agent’s mutable state and context, and return an updated state.

The code below from `strategy_cooperate.js` outlines a basic strategy in which the agent **always co-operates**.

```
function behavior(state, context) {
  if (state.checking_strategies) {
    state.curr_moves = {};
    return;
  }

  // Always cooperate
  context.neighbors().map(n => {
    state.curr_moves[n.agent_id] = "c";
  });  
};
```

In contrast, a mixed strategy is one where an agent makes a decision whether to co-operate or to defect.

For example, if we take a look at `strategy_tft.js`, we can see a 'tit-for-tat' strategy, in which agents following it will choose to cooperate only if the previous agent has been cooperative.

```
function behavior(state, context) {
  if (state.checking_strategies) {
    state.curr_moves = {};
    return;
  }

  context.neighbors().map(n => {
    if (!state.curr_histories[n.agent_id]) {
      // Always cooperate on the first move
      state.curr_moves[n.agent_id] = "c";
    } else {
      // Play what your opponent played last round
      const prev = state.curr_histories[n.agent_id].slice(-1)[0];
      state.curr_moves[n.agent_id] = prev.charAt(1);
    }
  });
}
```

Another strategy is the random strategy, outlined in `strategy_random.js`, which either co-operates or defects based on a random parameter.

```
function behavior(state, context) {
  if (state.checking_strategies) {
    state.curr_moves = {};
    return;
  }
  
  context.neighbors().map(n => {
    let moves = ["c", "d"];
    // Play randomly
    let move = moves[Math.floor(Math.random() * moves.length)];
    state.curr_moves[n.agent_id] = move;
  });
};
```

### Setting our simulation up

References to our different Prisoner's Dilemma strategies (each a separate behavior file in our simulation) are stored as global constants in the simulation. Taking a look at `globals.json`, the filenames in the globals array `strategies` are initialized on the agents and determine the agent’s move.

```
{
  "match_length": 10,
  "strategies": [
    "strategy_cooperate.js",
    "strategy_defect.js",
    "strategy_random.js",
    "strategy_tft.js",
    "strategy_pavlov.js"
  ],
  "strategy_colors": {
    "strategy_cooperate.js": "green",
    "strategy_defect.js": "red",
    "strategy_random.js": "yellow",
    "strategy_tft.js": "blue",
    "strategy_pavlov.js": "purple"
  },
  "topology": {
    "x_bounds": [0, 10],
    "y_bounds": [0, 10],
    "search_radius": 1
  }
}
```

Agents can cooperate every time or defect every time, or follow a random, tit-for-tat or Pavolvian strategy. Each agent is playing against multiple other agents at each time step.

Now we have our agents set up with their strategies, and instructions to play every turn, its time to layer in our game-logic. The code below, pulled from our `update_agents.js` file, in this first instance initializes all of our agents with a strategy chosen at random.

```
function behavior(state, context) {
  const { strategies, strategy_colors } = context.globals();

  state.agents["prisoners"].forEach(p => {
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];

    p.behaviors.splice(2, 0, strategy);
    p.color = strategy_colors[strategy];
  })
}
}
```

In HASH, agents can view their immediate neighbours using built-in functionality.

Taking a look at `score.js`, we can see a method that takes representations of the agents placed on a grid and updates the new strategy based on the neighbouring grid squares so far.

```
function adoptStrategies(sum, strategy_colors, state, context){
  const ns = context.neighbors();
  const myScores = state.scores.slice(-1)[0];
  const myAvg = sum(myScores) / myScores.length;

  const neighborScores = ns.map(n => n.scores.slice(-1)[0]);
  const neighborAvgs = neighborScores.map(ss => sum(ss) / ss.length);
    
  // Adopt a better strategy if there is one
  const maxNeighborAvg = Math.max(...neighborAvgs);

  if (myAvg < maxNeighborAvg) {
      // Adopt max scoring agent's strategy
    const newStrategy = ns[neighborAvgs.indexOf(maxNeighborAvg)].behaviors[2];
      
      // Simulation requires "strategy-" behavior to be in position [2]
    state.behaviors.splice(2, 1, newStrategy)
    state.color = strategy_colors[newStrategy];
  }
    
  state.checking_strategies = false;
}
```

The grid layout is the simplest of many layouts of agents that can be simulated in HASH. In this simulation, we have imported the `@hash/create_grids.js` behavior to set up the grid of agents in 3D space. The behavior is part of the [HASH standard library](https://hash.ai/docs/simulation/creating-simulations/libraries).

### Analyzing our output

Looking at the analysis view tab, we can easily see how many agents are currently using each strategy in an iterated Prisoner's Dilemma.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Fprisoners-dilemma&amp;ref=stable&amp;view=analysis" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

We can see that the tit-for-tat (tft) strategy dominates the others, as we can see from the output graphs. This is coded blue, which is why the squares in the 3D view all turn blue over the course of our iterated game.

## Trade & Prices

In economics, the concept of comparative advantage is used to explain the potential upsides of free trade. The theory states that even if an economy is less developed than its trading partner, it can still benefit from free trade by specializing in the production of certain types of goods.

This is because it can produce a particular good or service at a lower _opportunity cost_ than its trading partners. One way to conceptualize comparative advantage is by taking things "off the plate" of the more developed trading partner. For example, the world's best artist or programmer might also be world's most meticulous cleaner. While they could go into a career in art/programming or cleaning, they'd probably earn a lot more money engaging in the former. By focusing on the higher-value use of their time, they'd likely have enough money left over to hire a cleaner of their own, as well as some then left over, and may deem focusing on their "comparative advantage" worthwhile. Although they have an absolute advantage (being the best in the world) at both cleaning and their high-paid talents, focusing on those more specialized pursuits yields bigger dividends.

Economic theory predicts how trade and prices may converge on equilibriums, but cannot alone be used to predict patterns of trade between partners. In our next simulation, we'll see how the simple rule of comparative advantage leads to more complex endogenous patterns over time.

In this section, we will be following along with the [Simple Trading simulation](https://core.hash.ai/@hash/simple-trading/7.0.0). The colors in the simulation represent the price of apples, or how many apples can be traded for the equivalent amount of gold.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Fsimple-trading&amp;ref=stable" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

The simulation deals with a nxn grid of agents who have differing capabilities to produce apples and gold. Will they produce apples and gold, or specialize in one of the two? Unlike in idealized economic models, in the real world trade rarely exists in equilibrium.

### Setting up the simulation

We can see in `init.js` how this simulation is set up. Buyers and sellers are placed on a grid where they can only trade to neighbours. Based on global parameters, the simulation randomly initializes properties such as the number of apples or amount of gold each agent has. The simulation also generates a value to represent `skill`, or how difficult it is for an agent to produce a particular good.

```
const init = (context) => {
  const { topology, reserve, initial_apples, initial_price,
      initial_gold, skill_apples, skill_gold } = context.globals();

  const randInRange = (range) => {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  const genAgent = () => ({
    "behaviors": ["produce.js", "set_price.js", "buy.js", "sell.js"],
    "apples": randInRange(initial_apples),
    "gold": initial_gold,
    "reserve": randInRange(reserve),
    "skill_a": randInRange(skill_apples),
    "skill_g": randInRange(skill_gold),
    "bid_price": initial_price,
    "final_price": initial_price,
    "selling": false,
    "waiting": false,
    "sold": false
});

  const agents = hstd.init.grid(topology, genAgent);
  return agents;
}
```

### Buying apples

The `context` primitive in HASH makes it easy to write functions that agents can execute dependent on the environment they find themselves in (e.g. what their nearest neighbours are doing).

For example, in the behavior below, we're telling the agent to sort through and prioritize its neighbors according to lowest price on offer. Agents can then bid to buy apples with saved up gold reserves. Let's take a look at this behavior in `buy.js`.

```
function behavior(state, context) {
  const neighbors = context.neighbors();

  if (state.selling || state.waiting) {
    state.waiting = false;
    return;
  }

  // Find selling neighbors, sort low prices first
  const sellers = neighbors
    .filter(n => n.selling)
    .sort((n1, n2) => n1.bid_price - n2.bid_price);

  if (!sellers.length) { return; }

  // Send one buy offer
  if (state.bid_price >= sellers[0].bid_price) {
    state.addMessage(sellers[0].agent_id, "buy", {
      "price": state.bid_price,
      "gold": state.gold
    });

    state.waiting = true;
  }
};
```

The behaviors on each agent work on a state that is updated all at once every time step.

In our code below, the agent checks its neighbouring agents and makes a bid. However, the bid price of the nearest sellers will only update after the full time step for all agents is complete.

Agents can also communicate with each other via use of [messages](https://hash.ai/docs/simulation/creating-simulations/agent-messages). Messages are sent via agents before the computation of every time step. This allows for more complex coordination between agents.

### Selling at auction

Here, the bid price is used to set a color for the agent when displayed in 3D. Let's take a look at `set_price.js`.

```
function behavior (state, context) { 
  // Decide if you're selling or buying
  state.selling = state.apples > state.reserve;

  // Decide on bidding price
  const normApples = state.apples / state.reserve;
  const normGold = state.gold / (state.final_price * state.reserve);

  state.bid_price = state.final_price * 
    Math.pow(3*Math.E, normGold * (1 - normApples));

  function priceColor(price) {
    if (price < 0.5) { return "red"; }
    else if (price < 1) { return "orange"; }
    else if (price < 1.5) { return "yellow"; }
    else if (price < 2) { return "green"; }
    else { return "blue"; }
  }

  state.color = priceColor(state.final_price);
};
```

Apples are sold at a price that approximates the laws of supply and demand.

### Specializing production

In `produce.js`, we determine if an agent should produce more apples or more gold. The agent will consume one apple per time step, and will produce apples if it runs out. Otherwise, the agent will produce apples or gold based on a local price and the agents skill.

```
function behavior (state, context) {
  const messages = context.messages();
  const ns = context.neighbors();

  // Check messages for receipts from sellers
  const sales = messages.filter(m => m.type === "sell");
  if (sales.length > 0) {
    const { apples, cost } = sales[0].data;
    
    state.apples += apples;
    state.gold -= cost;
    state.final_price = cost / apples;
  }

  // An apple a day keeps the market at bay
  state.apples -= 1;

  // Diffuse final_price
  const sumFinalPrice = ns.reduce((acc, n) => acc + n.final_price, 0) + state.final_price;
  state.final_price = sumFinalPrice / (ns.length + 1);

  // Decide whether to produce apples or gold
  const outOfApples = state.apples <= 0;
  const applesMoreValuable = state.skill_g <= (state.final_price * state.skill_a);
  
  if (outOfApples || applesMoreValuable) {
    state.apples += state.skill_a;
    state.height = 3;
  } else {
    state.gold += state.skill_g;
    state.height = 1;
  }
};
```

## Running an experiment

We run an experiment in HASH that executes a simulation multiple times with different parameters, making it easy to compare results across lots of runs and ascertain a possible range of outcomes.

Let's vary the minimum skill it takes to produce an apple from 0 to 1. We can see that the price varies step-by-step.

![](images/selling-vs-not-selling.png)

The results show a wide distribution of outcomes -- even though we the simulation was generated using a simple set of instructions and parameters. We can see that the greatest changes in production are when the minimum `skill` is set to around `0.6`. HASH allows for building insights about these complex systems that go above and beyond the tools of normal econometrics.

[Learn more about creating experiments in HASH >](https://hash.ai/docs/simulation/creating-simulations/experiments)

## Queueing theory

Queuing theory is the study of the movement of agents through a line. Queuing systems represent a type of dynamic behavior that is difficult to model using equations, so make a perfect candidate for an agent-based modelling simulation.

There are a wide range of real-life applications of queuing theory and operations research more broadly. Mathematical queueing theory has been used in customer service, traffic systems design, warehouse design and cloud infrastructure design, and in this section we will take a look at applying the theory to a call center.

We've modeled a [circular call center](https://hash.ai/@hash/interconnected-call-center) that can receive and route calls using links between agents. Each link has a varied capacity in the simulation. It will model the wait time and proportion of balked calls in order to maximize the efficiency of the network.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Finterconnected-call-center&amp;ref=stable" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

We will model setting up a circle of agents that can generate, answer, and transfer calls, and use the simulation to better understand the dynamics of the network, especially when it is not in equilibrium. We'll use these insights to determine the optimal transfer capacity between links.

### Initialization and visualization

So far, we have initialized agents in HASH using one of the preset scripts, `create_grids.js`. However, it is also possible to use a script to set up a circular arrangement of agents. Let's have a look at `create_call_centres.js`.

```
//Set up a ring of n call centers and randomly generate variables
const behavior = (state, context) => {
  const { n_call_centers, call_distribution, skill_level, operators } = context.globals();

  let call_centers = [];
  let call_center_template = state.call_center_template

  for (let i = 0; i < n_call_centers; i++) {
    //Generate call centers in a circle
    let angle = i * Math.PI * 2.0 / n_call_centers;
    let call_center = generate_call_center(call_center_template, angle, n_call_centers, call_distribution, skill_level, operators)

    call_centers.push(call_center);
  }

  state.agents["call_centers"] = call_centers;
};
```

In addition to placing agents in a circle, we can also add a representation of links between them. Let's take a look at `create_links.js`.

```
const generateLink = (agent_a,agent_b, links_capacity) => {
  //Generate a link capacity at random
    const capacity = Math.round(Math.random() * (links_capacity.max - links_capacity.min)) + links_capacity.min;
    const available = capacity !== 0 ? true : false;

    //Tag every link with a standard agent ID
    const agent_id = hash_stdlib.generateAgentID();

    //Create a link between the two call centers
    const pos_a = agent_a.position;
    const pos_b = agent_b.position;

    const dx = pos_a[0] - pos_b[0]
    const dy = pos_a[1] - pos_b[1]
    const dx2 = dx ** 2
    const dy2 = dy ** 2

    const norm = (dx2 + dy2) ** 0.5
    const mid_x = (pos_a[0] + pos_b[0]) / 2
    const mid_y = (pos_a[1] + pos_b[1]) / 2


    //Create the link agent object, using parameters defined in HASH
    link = {
          agent_id,
          capacity,
          available,
          sent: 0,
          scale: [norm, 0.1, 0.1],
          height: 0.1,
          rgb: [0, 0, 255],
          center_1: agent_a.agent_id,
          center_2: agent_b.agent_id,
          position: [mid_x, mid_y],
          direction: [2*dy, -2*dx],
          behaviors: ["link_transfer.js"]
        }
    return link;
}
```

The links have a length equal to the distance between caller agents, and a width and height of 0.1. They are rotated to be placed between the caller agents.

### Generating and visualizing calls

Taking a look at `generate_calls.js`, we can see how the HASH standard library allows for statistical modelling of calls in the simulation.

```
const calls_generated = hash_stdlib.stats.triangular.sample(...state.call_generation)
```

The stats module in the HASH standard library provides a wide range of functions used in statistical modelling. You can check out the [full library on GitHub](https://github.com/hashintel/hash/tree/master/packages/engine/stdlib).

```
//For each call center, generate a set of random calls by sampling a distribution
const behavior = (state, context) => {
  const { mean_call_duration } = context.globals();

  if (state.counter !== 0) { return; }

  const calls_generated = hash_stdlib.stats.triangular.sample(...state.call_generation)

  for (let i = 0; i < Math.round(calls_generated); i++) {
    const call = {
      duration: generateDurationForAgent(mean_call_duration, state.skill_level),
      wait_time: 0,
      origin: state.agent_id
    };
    
    state.call_queue.push(call);
  };
};
```

Calls are generated stochastically and added to a queue. This simulates the behavior of random calls arriving at a center.

Taking a look at `link_transfer.js`, we can see how the simulation displays links and their capacity to forward calls. If a call to a link is made when there is not enough capacity, the call is balked.

```
  if (index < external_calls.length) {
    for (let i = index; i < external_calls.length; i++) {
      state.addMessage(external_calls[index].from, "balked_call");
    }
  }
```

The flow of traffic in the queuing simulation can be understood through color coding.

```
  // // Visuals 
  const color_proportion = state.sent / state.capacity;
  if (!color_proportion) {
    state.rgb = [0, 0, 0]
  } else {
    state.rgb = [255 * color_proportion, 0, 255];
  }
```

Our main call center agents are also color coded, but this time based on the proportion of calls that make it through. Let's take a look at `answer_calls.js`.

```
const behavior = (state, context) => {
  //---------- 
  // Answering calls code 
  //---------- 


  // Visuals 
  const color_proportion = (state.current_calls.length + state.call_queue.length) / (20 + state.operators);
  state.rgb = [255, 255 - 255 * color_proportion, 255 - 255 * color_proportion];

  state.height = state.current_calls.length;
}
```

Each agent has a property `state.rgb` that allows for a behavior to modify the display color. In this case, we use the color to code the agents by success rate.

![](images/call-center-viz-basic.png)

### Running the simulation

Let's take a quick peek at the `analysis.json` file before running our simulation. We can see that one of the charts tracks the number of balked calls, which plots a simple timeseries using the variable.

```
{
      "title": "Calls Balked",
      "timeseries": ["balked_calls"],
      "layout": {"width": "100%", "height": "50%"},
      "position": {"x": "0%", "y": "50%"}
},
```

Taking a look at the analysis tab, we can easily see the timeseries data for the number of balked calls on a graph.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Finterconnected-call-center&amp;ref=stable&amp;view=analysis" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

Now let's use this output to optimize the link capacity, and minimize balked calls.

Taking a look at `experiments.json`, we can run an experiment to optimize the transfer capacity of the network. The aim is to minimize the number of balked calls, while not spending too much extra on link capacity.

```
"Optimize Transfer Capacity": {
    "type": "optimization",
    "maxRuns": 30,
    "minSteps": 1000,
    "maxSteps": 1500,
    "metricName": "balked_calls",
    "metricObjective": "min",
    "fields": [
      {
        "name": "links_capacity.max",
        "values": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      }
    ]
  }
```

The above experiments code can be written by hand, or created using the **Experiments** menu in [hCore](https://hash.ai/platform/core) (recommended). It is set to run for 1000 steps. We can then take a look at the collated analysis of the output curves to understand much more about the network than just the optimized result.

![](images/basic-experiment.png)

## Hotelling's Law

Hotelling's Law explains why markets sometimes converge, and why agents might make their offerings as similar to one another as possible.

Consider a long beach, where two ice cream vendors have to decide where to place their trucks to get the most customers. Paradoxically, the optimal place for both vendors is in the middle of the beach, even though having both trucks in the same place is bad overall for consumers.

Hotelling's Law can be applied in a wide variety of situations, from the location of ice cream trucks to the price of hamburgers, or even the policy positions of political parties. Like many laws in economics, Hotelling's Law is only 'absolutely' true when a system is in perfect equilibrium. Using simulation, we will see how it actually often works in practice.

We'll be examining Hotelling's Law by using a simulation to track the offerings of shops in a real life neighbourhood. The [Local Competition](https://core.hash.ai/@hash/local-competition/stable) simulation uses a dataset to model these shops.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Flocal-competition&amp;ref=stable&amp;view=geo" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

### Making use of data

HASH allows you to search for and import public datasets to be used in a simulation, as well as uploading your own private data.

In this case, we can take a look at `create_businesses.js` to see how the imported public data is used to initialize the simulation.

```
const keys = {};

const behavior = (state, context) => {
  const { num_businesses } = context.globals();

  const business_colors = ["red", "yellow", "blue", "orange", "green"]

  Array(num_businesses)
    .fill()
    .map((val, id) => {
      const agent_templates = state.get("agent_templates");
      const template = agent_templates[id];

      const data = {
        ...template,
        popup_fields: ["position", "item_price", "desired_position", "desired_price"],
        item_price: 750,
        profit: Math.floor((Math.random() * 500000) + 1000000),
        tenancy_length: 0,
        color: business_colors[id],
        desired_position: null,
        desired_price: null,
        open_location_positions: [],
        vacant_lot_ids: state.vacant_lot_ids,
        open_auctions: {},
        winner_data: null,
        new_business: true,
        behaviors: ["collect_auctions.js", "update_auctions.js", "collect_auction_winners.js", "business.js", "update_lng_lat.js"]
      };

      state.addMessage("HASH", "create_agent", data);
    })

  return state;
}
```

### Mapping with coordinates

This initialization script generates a set of customers using the dataset, mapping coordinates in 2D. If we take a look at `create_customers.js`, we use the values in the `lng_lat` variable to determine a shoppers longitude and latitude.

```
const keys = {};

const behavior = (state, context) => {
  const globals = context.globals();

  context.data()["@sophiad/subset-data/property.csv"]
    .map(home => {
      const split_address = home["Address"].split('(').join(', ').split(')').join(', ').split(', ')
      const lng_lat = [parseFloat(split_address[3]), parseFloat(split_address[2])]

      const pos_x = 1000.0 * (lng_lat[0] - globals.boston_lng)
      const pos_y = 1000.0 * (lng_lat[1] - globals.boston_lat)

      const position = [pos_x, pos_y]
      
      state.addMessage("HASH", "create_agent", {
        position,
        lng_lat,
        rgb: [255, 255, 255],
        behaviors: ["customer.js"]
      });
    })

  return state;
}
```

These agents have a display in the 3D viewer as well as in the geospatial viewer.

### Geospatial computing

The geospatial model can be used to find neighbours on a map. Similar to the 3D model, agents' behaviors run in parallel and their states are updated all at once for every time step.

```

const behavior = (state, context) => {
  const messages = context.messages();
  const neighbors = context.neighbors();

  const businesses = neighbors.filter((neighbor) => neighbor.behaviors.includes("business.js"))

  //---------
  //Customer.js code
  //----------
}
```

In this case, the `customer.js` script is able to search for neighboring businesses and find the lowest price.

```
  // Function to determine cost --> business price + distance from business
  const calculate_cost = (position, price) => {
    const state_position = state.get("position");
    return price + Math.sqrt(Math.pow((state_position[0] - position[0]), 2) + Math.pow((state_position[1] - position[1]), 2))

  }
```

### Profit-maximizing

This script models behavior of businesses to open in the locations that are most likely to turn a profit. Taking a look at `business.js`, we see that there is code for running an auction for a location.

```
  const bid = () => {
    const desired_position = state.get("desired_position");
    let open_auctions = state.get("open_auctions");

    const location_price = open_auctions[JSON.stringify(desired_position)].price;
    const desire = Math.random();
    const bid = state.get("profit") * desire;

    // Bid if price is desirable and affordable
    if (bid >= location_price) {
      state.addMessage(open_auctions[JSON.stringify(desired_position)].auction_id, "bid", { bid });
    }

    state.set("open_auctions", open_auctions);
  }
```

Just like in real life, our simulated businesses will try and open in places that are desirable and affordable.

HASH allows users to program [auction simulations](https://hash.ai/blog/crypto-dynamics-auctions) with custom behavior. In this case, we model a simple Dutch auction, an auction where the price is determined after taking in all bids to arrive at the highest price at which the total offering can be sold.

```
const behavior = (state, context) => {
  const businesses_ids = state.get("businesses_ids");
  const position = state.get("position");
  let dutch_price = state.get("dutch_price");
  let winner_id = state.get("winner_id");

  // Winner was already found
  if (winner_id !== null) {
    return state
  }

  //--------
  //Auction code
  //-------
}
```

Taking a look at `location_dutch_auction.js`, we see that businesses in the model are able to bid on desirable locations at each turn.

### Running our simulation

We can use the simulation to see Hotelling's law in action. We can run an experiment to show how the offerings of buinseses converge on a similar point. Let's take a look at at the analysis graph showing customer's decisions.

<iframe src="https://core.hash.ai/embed.html?project=%40hash%2Flocal-competition&amp;ref=stable&amp;view=analysis" width="1000" height="600" frameborder="0" scrolling="auto"></iframe>

After running the simulation for a sufficient number of steps, the offerings converge on two sets of similar products, just as Hotelling's Law predicts.

## In summary

That's it for this post. If you want to take the ideas mentioned here course further, please check out any of the [open-source simulations](https://hash.ai/models) built on HASH which are available for download, or read the [HASH simulation-development docs](https://hash.ai/docs/simulation).

We recommend getting started with the [wildfires simulation](https://hash.ai/@hash/wildfires-regrowth), or the [interconnected call center](https://hash.ai/@hash/interconnected-call-center) that was mentioned earlier in this piece. Thanks for joining us, and we hope to see you in our [Discord](https://hash.ai/discord) or on the platform!