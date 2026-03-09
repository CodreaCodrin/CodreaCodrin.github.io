import PageWrapper from '../../components/layout/PageWrapper';

export default function About() {
    return (
        <PageWrapper className="max-w-3xl">
            <h1
                className="text-5xl font-extrabold text-center"
                style={{ color: "var(--color-primary)" }}
            >
                About, e gol tata
            </h1>
        </PageWrapper>
    )
}