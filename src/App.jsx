import Navbar from './components/Navbar'
import ProjectCard from './components/ProjectCard'
import Section from './components/Section'
import Links from './components/Links'
import snake2 from './assets/projects/snake2.png'
import cubeForce from './assets/projects/cube-force.png'
import leavesSegModel from './assets/projects/leaves-segmentation-model.png'
import timetable from './assets/projects/timetable.png'
import './App.css'

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Section id="about" title="Hi, I'm Luke :D" headingLevel="h1">
          <p>
            Software Engineering @ UWaterloo
            <br/>
            I like learning about programming and building cool projects.
            I've worked with applied ML, constraint programming, game dev, and web dev. 
            Outside of tech, I enjoy playing badminton.
            I'd be down to connect at any of the <a href="/#links">links</a> below!
          </p>
        </Section>

        <Section id="projects" title="Projects">
          <div className="projects-grid">
            <ProjectCard
              title="Leaves Segmentation Model"
              description="Interned with UVic’s ECE department, developing an ML image segmentation model using PyTorch Lightning to detect leaves, which can significantly obstruct satellite signals. This model performed well with real-world test cases."
              image={leavesSegModel}
            />
            <ProjectCard
              title="Snake2"
              description="Snake2 puts a unique spin on the classic Snake game by pitting two players against each other in a fast-paced, competitive duel. 
              Features a CPU controlled player using heuristic scoring."
              image={snake2}
              href="https://github.com/der1py/snake2"
              demo="https://der1py.github.io/snake2/"
            />
            <ProjectCard
              title="Cube Force"
              description="An arena shooter game supporting up to 4 players, written entirely in Java for a school project."
              image={cubeForce}
              href="https://github.com/LordoCreations/CSGame"
            />
            <ProjectCard
              title="School Timetable Optimizer"
              description="A constraint-programming project that builds a school-wide master timetable and assigns students to course sections across eight blocks, using real school data.
              The project uses Google's CP-SAT Solver to build an optimized timetable."
              image={timetable}
              href="https://github.com/der1py/APCS-Final-Project"
            />
          </div>
        </Section>

        <Section id="links" title="Links">
          <Links />
        </Section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} Luke Fan</p>
      </footer>
    </>
  )
}

export default App
