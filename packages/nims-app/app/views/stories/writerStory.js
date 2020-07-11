export default function createWriterStory(Stories){
    const state = {};

    let content;
    function getContent() {
        return content;
    }

    function init(){
        U.listen(U.queryEl('#writerStoryArea'), 'change', updateWriterStory);
        content = U.queryEl('#writerStoryDiv2');
    };

    function refresh(){
        const storyArea = U.queryEl('#writerStoryArea');
        const storyName = Stories.getCurrentStoryName();

        if (storyName) {
            DBMS.getWriterStory({ storyName }).then((story) => {
                storyArea.value = story;
            }).catch(UI.handleError);
        } else {
            storyArea.value = '';
        }
    };

    function updateWriterStory() {
        const storyArea = U.queryEl('#writerStoryArea');
        DBMS.setWriterStory({
            storyName: Stories.getCurrentStoryName(),
            value: storyArea.value
        }).catch(UI.handleError);
    }
    return {
        init, getContent, refresh
    };
};

//(window.WriterStory = {});
