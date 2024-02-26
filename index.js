const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const startGame = document.querySelector('#startGame')
const modelEL = document.querySelector('#modelEL')
const endScore = document.querySelector('#endScore')

class Player {
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

class Bullet {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 12, 'white') 
let bullets = []
let enemies = []
let particles = []

function init(){
    player = new Player(x, y, 12, 'white') 
    bullets = []
    enemies = []
    particles = []
    score = 0;
    scoreDisplay.textContent = 'Score: ' + score;
    endScore.innerHTML = score
}

function spawEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 5) + 5
        let x
        let y

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        
        const color = `hsl(${Math.random() * 360}, 50%, 50% )`
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x 
        )
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))}, 1000)
}

let animationId
function animate(){
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(10, 0, 38, 0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
            particle.update()
        }
    })

    
    bullets.forEach((bullet, index) => { 
        bullet.update()

        // Remove form edges
        if(bullet.x + bullet.radius < 0 || 
            bullet.x - bullet.radius > canvas.width ||
            bullet.y + bullet.radius < 0 ||
            bullet.y - bullet.radius > canvas.height){
            setTimeout(() => {
                bullets.splice(index, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        const dist = Math.hypot(
            player.x - enemy.x, 
            player.y - enemy.y)
        // End Game
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            modelEL.style.display = 'flex'
            endScore.innerHTML = score
        }

        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(
                bullet.x - enemy.x, 
                bullet.y - enemy.y)

            // When bullets touch the enemy
            if(dist - enemy.radius - bullet.radius < 1){
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(bullet.x, bullet.y, 
                        Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 5), 
                        y: (Math.random() - 0.5) * (Math.random() * 5)}))
                }
                if(enemy.radius - 10 > 5){
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        bullets.splice(bulletIndex, 1)
                    }, 0)
                }else{
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        bullets.splice(bulletIndex, 1)
                    }, 0)
                }

                score += 50;
                updateScoreDisplay();
            }
        })
    })
}

let score = 0;

function updateScoreDisplay(){
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.textContent = 'Score: ' + score;
}

addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2 
    )
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }

    bullets.push(
        new Bullet(
            canvas.width / 2, 
            canvas.height / 2, 
            5, 'white', velocity
        )
    )
})

startGame.addEventListener('click', () => {
    init()
    animate()
    spawEnemies()
    modelEL.style.display = 'none'
})
// animate()
// spawEnemies()